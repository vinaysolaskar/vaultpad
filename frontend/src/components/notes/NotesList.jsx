import { useState } from "react"

export default function NotesList({
    notes,
    activeNoteId,
    onSelect,
}) {
    const [query, setQuery] = useState("")

    const filteredNotes = notes.filter((note) =>
        (note.title || "")
            .toLowerCase()
            .includes(query.toLowerCase())
    )

    return (
        <div className="flex-1 flex flex-col">
            {/* Search */}
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes..."
                className="mx-2 my-2 px-2 py-1 text-sm border rounded outline-none"
            />

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredNotes.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">
                        No matching notes
                    </p>
                )}

                {filteredNotes.map((note) => (
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
        </div>
    )
}