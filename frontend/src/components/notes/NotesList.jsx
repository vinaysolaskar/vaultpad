import { format } from "date-fns";

export default function NotesList({ notes, activeNoteId, onSelect }) {
    return (
        <div className="flex-1 overflow-y-auto px-2 space-y-1 mt-4">
            {notes.map((note) => (
                <div
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`group cursor-pointer px-3 py-3 rounded-lg transition-all ${note.id === activeNoteId ? "bg-[#2F2F2F]" : "hover:bg-[#2F2F2F]/40"
                        }`}
                >
                    {/* Title Truncation: Max length handled by CSS */}
                    <h3 className="text-sm font-medium truncate max-w-[200px] text-[#EBEBEB]">
                        {note.title || "Untitled"}
                    </h3>

                    {/* Dates visible prominently */}
                    <div className="mt-1 flex flex-col space-y-0.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                            <span className="w-10">EDITED</span>
                            <span className="text-gray-400 font-bold">
                                {note.updated_at ? format(new Date(note.updated_at), 'MMM d, h:mm a') : 'Now'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="w-10">CREATED</span>
                            <span>
                                {note.created_at ? format(new Date(note.created_at), 'MMM d, yyyy') : 'Now'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}