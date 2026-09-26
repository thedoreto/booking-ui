import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import aiApi from "../../api/aiApi.js";
import { useChat } from "./useChat.js";
import RoomSelection from "./RoomSelection.jsx";

// Снимките в чата идват готови в списъка със стаи от AI асистента (room.images) – чатът не вика booking-system
vi.mock("../../api/aiApi.js", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const USER = { id: "user-1", name: "Гост" };

const ROOM_WITH_IMAGES = {
    id: "room-1", roomNumber: 12, type: "DOUBLE", pricePerNight: 100,
    images: [
        { id: "img-2", url: "https://cdn.example.com/2.jpg", title: "Баня" },
        { id: "img-http", url: "http://insecure.example.com/5.jpg", title: "Без https" },
        { id: "img-1", url: "https://cdn.example.com/1.jpg", title: "Легло" },
        { id: "img-3", url: "https://cdn.example.com/3.jpg", title: "Изглед" },
        { id: "img-4", url: "https://cdn.example.com/4.jpg", title: "Балкон" }
    ]
};
const ROOM_WITHOUT_IMAGES = { id: "room-2", roomNumber: 14, type: "SINGLE", pricePerNight: 70, images: [] };

describe("снимките на стаите в useChat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        aiApi.get.mockResolvedValue({ data: [] }); // бутони и типове стаи
    });

    afterEach(cleanup);

    it("дава до 3 https снимки на стая в реда от AI асистента, без отделна заявка за снимки", async () => {
        const hook = renderHook(() => useChat(USER, "seven_stars"));
        await waitFor(() => expect(aiApi.get).toHaveBeenCalled());
        aiApi.post.mockResolvedValueOnce({
            data: {
                reply: "Свободни стаи",
                actionType: "SELECT_ROOMS",
                data: { startDate: "2026-10-30", endDate: "2026-11-02", rooms: [ROOM_WITH_IMAGES, ROOM_WITHOUT_IMAGES] }
            }
        });

        await act(() => hook.result.current.handleDatesSelected("2026-10-30", "2026-11-02"));

        expect(aiApi.post).toHaveBeenCalledTimes(1);
        expect(aiApi.get.mock.calls.map(([path]) => path)).not.toContain("/images");
        expect(hook.result.current.roomImages(ROOM_WITH_IMAGES).map(image => image.url)).toEqual([
            "https://cdn.example.com/2.jpg",
            "https://cdn.example.com/1.jpg",
            "https://cdn.example.com/3.jpg"
        ]);
        expect(hook.result.current.roomImages(ROOM_WITHOUT_IMAGES)).toEqual([]);
        expect(hook.result.current.roomImages({ id: "room-3" })).toEqual([]);
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
