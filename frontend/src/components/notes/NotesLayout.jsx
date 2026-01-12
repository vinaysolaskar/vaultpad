import { useState } from "react";
import Navbar from "../Navbar";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import CreateNoteButton from "./CreateNoteButton";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../hooks/useNotes";

export default function NotesLayout() {
    const { user } = useAuth();
    const { notes, activeId, setActiveId, create, remove, loading, setNotes } = useNotes(user);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

    const activeNote = notes.find(n => n.id === activeId);

    const handleNoteUpdate = (updatedNote) => {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === updatedNote.id
                    ? { ...n, title: updatedNote.title, updated_at: updatedNote.updated_at }
                    : n
            )
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#191919] text-gray-400">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#202020] text-[#EBEBEB] overflow-hidden relative">

            <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex flex-1 overflow-hidden relative">
                <aside className={`
                    fixed inset-y-0 left-0 z-[100] w-72 bg-[#191919] border-r border-[#2F2F2F] 
                    transform transition-transform duration-300 ease-in-out 
                    md:relative md:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <div className="flex flex-col h-full overflow-y-auto">
                        {/* Mobile Close Button - Only visible on small screens */}
                        <div className="flex justify-end p-2 md:hidden">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sticky top-0 bg-[#191919] z-10">
                            <CreateNoteButton onCreate={create} />
                        </div>

                        <div className="flex-1">
                            <NotesList
                                notes={notes}
                                activeNoteId={activeId}
                                onSelect={(id) => {
                                    setActiveId(id);
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-[#202020] relative overflow-hidden">
                    <NoteEditor
                        key={activeId}
                        noteId={activeId}
                        noteData={activeNote}
                        onDelete={remove}
                        onNoteUpdate={handleNoteUpdate}
                    />
                </main>
            </div>
        </div>
    );
}   