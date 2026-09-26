import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import aiApi from "../../api/aiApi.js";
import { newSessionId, useChat } from "./useChat.js";

// Всеки отворен чат е отделен разговор за AI асистента (sessionId) – двама гости не делят памет
vi.mock("../../api/aiApi.js", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

async function openChat() {
    const hook = renderHook(() => useChat(null, "seven_stars"));
    await waitFor(() => expect(aiApi.get).toHaveBeenCalled());
    return hook;
}

async function send(hook, text) {
    act(() => hook.result.current.setInput(text));
    await act(() => hook.result.current.sendMessage());
}

describe("разговорът с AI асистента", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        aiApi.get.mockResolvedValue({ data: [] });
        aiApi.post.mockResolvedValue({ data: { reply: "Здравейте" } });
    });

    afterEach(cleanup);

    it("праща един и същ sessionId в рамките на един чат, а друг чат има друг", async () => {
        const first = await openChat();
        await send(first, "Здравей");
        await send(first, "Имате ли басейн?");
        const second = await openChat();
        await send(second, "Здравей");

        const sessionIds = aiApi.post.mock.calls.map(([, body]) => body.sessionId);
        expect(sessionIds[0]).toMatch(/^[0-9a-f-]{36}$/);
        expect(sessionIds[1]).toBe(sessionIds[0]);
        expect(sessionIds[2]).not.toBe(sessionIds[0]);
    });

    it("и без crypto.randomUUID (http) прави валиден UUID v4", () => {
        const randomUUID = crypto.randomUUID;
        crypto.randomUUID = undefined;
        try {
            const first = newSessionId();
            const second = newSessionId();
            expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(second).not.toBe(first);
        } finally {
            crypto.randomUUID = randomUUID;
        }
    });
});
