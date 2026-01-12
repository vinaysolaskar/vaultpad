import EditorFooter from "../EditorFooter";
import { useNoteEditor } from "../../hooks/useNoteEditor";

export default function NoteEditor({ noteId, onDelete, onNoteUpdate }) {
    const {
        title, setTitle,
        content, setContent,
        isEditing, setIsEditing,
        status, loading
    } = useNoteEditor(noteId, onNoteUpdate);

    if (!noteId) return <div className="flex-1 flex items-center justify-center text-gray-400">Select a note</div>;
    if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex-1 p-6 flex flex-col">
            <input
                value={title}
                disabled={!isEditing}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isEditing ? "Add a Title" : "Untitled"}
                className="text-2xl p-3 font-semibold mb-4 outline-none"
            />
            <textarea
                value={content}
                readOnly={!isEditing}
                onChange={(e) => setContent(e.target.value)}
                className={`flex-1 p-3 resize-none outline-none ${isEditing ? "text-gray-800" : "text-gray-500"}`}
                placeholder={isEditing ? "Start writing..." : "Press Edit to modify"}
            />
            <EditorFooter
                isEditing={isEditing}
                status={status}
                onToggleEdit={() => setIsEditing(v => !v)}
                onDelete={() => onDelete(noteId)}
            />
        </div>
    );
}