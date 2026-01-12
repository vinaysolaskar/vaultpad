import { describe, it, expect, vi, beforeEach } from "vitest";
import { queueOperation } from "../hooks/useOfflineQueue";

describe("Offline Synchronization Logic", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('navigator', { onLine: false });
    });

    it("should queue a delete operation when offline", () => {
        const noteId = "test-123";
        queueOperation({ type: "delete", noteId });

        const queue = JSON.parse(localStorage.getItem("offline:queue"));
        expect(queue).toHaveLength(1);
        expect(queue[0].type).toBe("delete");
        expect(queue[0].noteId).toBe(noteId);
    });

    it("should prevent duplicate create-delete jobs in queue", () => {
        const noteId = "temp-uuid";

        // Simulate creating then immediately deleting a note while offline
        queueOperation({ type: "create", noteId, payload: {} });
        queueOperation({ type: "delete", noteId });

        const queue = JSON.parse(localStorage.getItem("offline:queue"));
        // The queue should be empty because delete cancelled out the create
        expect(queue).toHaveLength(0);
    });
});