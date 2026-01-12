import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import CreateNoteButton from "./CreateNoteButton";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../hooks/useNotes";

export default function NotesLayout() {
    const { user } = useAuth();
    const { notes, activeId, setActiveId, create, remove, loading, setNotes } = useNotes(user);

    const handleNoteUpdate = (updatedNote) => {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === updatedNote.id
                    ? { ...n, title: updatedNote.title, updated_at: updatedNote.updated_at }
                    : n
            )
        );
    };

    if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-full">
            <div className="w-64 border-r flex flex-col">
                <CreateNoteButton
                    onCreate={create}
                />
                <NotesList notes={notes} activeNoteId={activeId} onSelect={setActiveId} />
            </div>

            <NoteEditor
                key={activeId}
                noteId={activeId}
                onDelete={remove}
                onNoteUpdate={handleNoteUpdate}
            />
        </div>
    );
}