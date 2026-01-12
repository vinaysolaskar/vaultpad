/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotesLayout from "../components/notes/NotesLayout";
import { AuthProvider } from "../context/AuthContext";

// 1. Mock Supabase with an active session so it skips the Loading state
vi.mock("../lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { id: 'real-123', title: 'Test Note' },
                error: null
            }),
        })),
        auth: {
            // Mock a logged-in user session immediately
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: 'user123', email: 'test@example.com' } } }
            }),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            })),
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'user123' } }
            }),
        }
    }
}));

describe("Notes Functionality", () => {
    it("should show 'Select a note' after loading finishes", async () => {
        render(
            <AuthProvider>
                <NotesLayout />
            </AuthProvider>
        );

        // 2. Wait for the "Loading..." text to disappear
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        // 3. Now check for the empty state
        expect(screen.getByText(/Select a note/i)).toBeInTheDocument();
    });

    it("should create a new note when the button is clicked", async () => {
        render(
            <AuthProvider>
                <NotesLayout />
            </AuthProvider>
        );

        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        const createBtn = screen.getByText(/\+ New note/i);
        fireEvent.click(createBtn);

        // Check for "Untitled" (Optimistic UI update)
        const noteItems = await screen.findAllByText(/Untitled/i);
        expect(noteItems.length).toBeGreaterThan(0);
    });
});