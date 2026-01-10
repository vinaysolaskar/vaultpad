export default function NotesList({
    notes,
    activeNoteId,
    onSelect,
}) {
    if (notes.length === 0) {
        return (
            <p className="p-4 text-sm text-gray-500">
                No notes yet
            </p>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {notes.map((note) => (
                <button
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${note.id === activeNoteId ? "bg-gray-100" : ""
                        }`}
                >
                    <p className="font-medium truncate">
                        {note.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {new Date(note.updated_at).toLocaleString()}
                    </p>
                </button>
            ))}
        </div>
    )
}