import { useState } from "react"
import NotesList from "./NotesList"
import NoteViewer from "./NoteViewer"
import CreateNoteButton from "./CreateNoteButton"
import { supabase } from "../../lib/supabase"

export default function NotesLayout() {
    const [activeNoteId, setActiveNoteId] = useState(null)

    async function handleDelete(noteId) {
        await supabase.from("notes").delete().eq("id", noteId)
        setActiveNoteId(null)
    }

    return (
        <div className="flex h-full">
            <div className="w-64 border-r flex flex-col">
                <CreateNoteButton onCreate={setActiveNoteId} />
                <NotesList onSelect={setActiveNoteId} />
            </div>

            <NoteViewer
                noteId={activeNoteId}
                onDelete={handleDelete}
            />
        </div>
    )
}