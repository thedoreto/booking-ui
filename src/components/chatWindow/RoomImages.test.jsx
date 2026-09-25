import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import aiApi from "../../api/aiApi.js";
import { useChat } from "./useChat.js";
import RoomSelection from "./RoomSelection.jsx";

// Снимките в чата: една заявка GET /images към booking-system, после всяка стая си взима своите по imageIds
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("../../api/aiApi.js", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const USER = { id: "user-1", name: "Гост" };

const HOTEL_IMAGES = [
    { id: "img-1", url: "https://cdn.example.com/1.jpg", title: "Легло" },
    { id: "img-2", url: "https://cdn.example.com/2.jpg", title: "Баня" },
    { id: "img-3", url: "https://cdn.example.com/3.jpg", title: "Изглед" },
    { id: "img-4", url: "https://cdn.example.com/4.jpg", title: "Балкон" },
    { id: "img-http", url: "http://insecure.example.com/5.jpg", title: "Без https" }
];

function roomsResponse(rooms) {
    return {
        data: {
            reply: "Свободни стаи",
            actionType: "SELECT_ROOMS",
            data: { startDate: "2026-10-30", endDate: "2026-11-02", rooms }
        }
    };
}

const ROOM_WITH_IMAGES = {
    id: "room-1", roomNumber: 12, type: "DOUBLE", pricePerNight: 100,
    imageIds: ["img-2", "missing", "img-http", "img-1", "img-3", "img-4"]
};
const ROOM_WITHOUT_IMAGES = { id: "room-2", roomNumber: 14, type: "SINGLE", pricePerNight: 70, imageIds: [] };

async function renderChat() {
    const hook = renderHook(() => useChat(USER, "seven_stars"));
    await waitFor(() => expect(aiApi.get).toHaveBeenCalled());
    return hook;
}

async function searchRooms(hook, rooms) {
    aiApi.post.mockResolvedValueOnce(roomsResponse(rooms));
    await act(() => hook.result.current.handleDatesSelected("2026-10-30", "2026-11-02"));
}

describe("снимките на стаите в useChat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        aiApi.get.mockResolvedValue({ data: [] }); // бутони и типове стаи
    });

    afterEach(cleanup);

    it("зарежда всички снимки с една заявка и дава до 3 https снимки на стая по реда в imageIds", async () => {
        localStorage.setItem("token", "jwt-token");
        axios.get.mockResolvedValue({ data: HOTEL_IMAGES });
        const hook = await renderChat();

        await searchRooms(hook, [ROOM_WITH_IMAGES, ROOM_WITHOUT_IMAGES]);
        await searchRooms(hook, [ROOM_WITH_IMAGES]);

        expect(axios.get).toHaveBeenCalledTimes(1);
        const [path, options] = axios.get.mock.calls[0];
        expect(path).toBe("/images");
        expect(options.headers).toEqual({ Authorization: "Bearer jwt-token" });

        await waitFor(() => expect(hook.result.current.roomImages(ROOM_WITH_IMAGES)).toHaveLength(3));
        expect(hook.result.current.roomImages(ROOM_WITH_IMAGES).map(image => image.url)).toEqual([
            "https://cdn.example.com/2.jpg",
            "https://cdn.example.com/1.jpg",
            "https://cdn.example.com/3.jpg"
        ]);
        expect(hook.result.current.roomImages(ROOM_WITHOUT_IMAGES)).toEqual([]);
        expect(hook.result.current.roomImages({ id: "room-3" })).toEqual([]);
    });

    it("без вход не прави заявка за снимките", async () => {
        const hook = await renderChat();

        await searchRooms(hook, [ROOM_WITH_IMAGES]);

        expect(axios.get).not.toHaveBeenCalled();
        expect(hook.result.current.roomImages(ROOM_WITH_IMAGES)).toEqual([]);
    });

    it("не прави заявка, ако никоя стая няма снимки", async () => {
        localStorage.setItem("token", "jwt-token");
        const hook = await renderChat();

        await searchRooms(hook, [ROOM_WITHOUT_IMAGES]);

        expect(axios.get).not.toHaveBeenCalled();
    });

    it("след грешка опитва отново при следващия списък със стаи", async () => {
        localStorage.setItem("token", "jwt-token");
        vi.spyOn(console, "error").mockImplementation(() => {});
        axios.get
            .mockRejectedValueOnce(new Error("Network Error"))
            .mockResolvedValueOnce({ data: HOTEL_IMAGES });
        const hook = await renderChat();

        await searchRooms(hook, [ROOM_WITH_IMAGES]);
        await waitFor(() => expect(console.error).toHaveBeenCalled());
        expect(hook.result.current.roomImages(ROOM_WITH_IMAGES)).toEqual([]);

        await searchRooms(hook, [ROOM_WITH_IMAGES]);

        expect(axios.get).toHaveBeenCalledTimes(2);
        await waitFor(() => expect(hook.result.current.roomImages(ROOM_WITH_IMAGES)).toHaveLength(3));
    });
});

describe("снимките на стаите в RoomSelection", () => {
    afterEach(cleanup);

    const images = {
        "room-1": [
            { url: "https://cdn.example.com/1.jpg", title: "Легло" },
            { url: "https://cdn.example.com/2.jpg", title: "Баня" }
        ]
    };

    function renderSelection() {
        render(
            <RoomSelection
                selection={{
                    startDate: "2026-10-30",
                    endDate: "2026-11-02",
                    rooms: [ROOM_WITH_IMAGES, ROOM_WITHOUT_IMAGES],
                    status: "open"
                }}
                onBook={() => {}}
                roomTypeName={code => code}
                roomImages={room => images[room.id] || []}
            />
        );
    }

    it("показва снимките на стаята, а стая без снимки е без снимки", () => {
        renderSelection();

        const shown = screen.getAllByRole("img");
        expect(shown.map(image => image.getAttribute("src"))).toEqual([
            "https://cdn.example.com/1.jpg",
            "https://cdn.example.com/2.jpg"
        ]);
        expect(shown[0].getAttribute("alt")).toBe("Легло");
        expect(shown[0].getAttribute("loading")).toBe("lazy");
    });

    it("скрива снимка, която не се зарежда", () => {
        renderSelection();

        fireEvent.error(screen.getByAltText("Легло"));

        expect(screen.queryByAltText("Легло")).toBeNull();
        expect(screen.getByAltText("Баня")).toBeTruthy();
    });

    it("клик върху снимка не маркира стаята, а клик върху картичката я маркира", () => {
        renderSelection();
        const [checkbox] = screen.getAllByRole("checkbox");

        fireEvent.click(screen.getByAltText("Легло"));
        expect(checkbox.checked).toBe(false);

        fireEvent.click(screen.getByText(/Стая №12/));
        expect(checkbox.checked).toBe(true);
    });
});
