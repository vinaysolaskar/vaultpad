export default function NotesList({ notes, activeNoteId, onSelect }) {
    return (
        <div className="flex-1 overflow-y-auto">
            {notes.map((note) => (
                <div
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`cursor-pointer px-4 py-2 border-b hover:bg-gray-100 ${note.id === activeNoteId ? "bg-gray-200 font-semibold" : ""
                        }`}
                >
                    {note.title || "Untitled"}
                </div>
            ))}
        </div>
    )
}