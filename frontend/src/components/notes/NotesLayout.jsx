import { useEffect, useState } from "react"
import NotesList from "./NotesList"
import NoteViewer from "./NoteViewer"
import CreateNoteButton from "./CreateNoteButton"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

export default function NotesLayout() {
    const { user } = useAuth()
    const [notes, setNotes] = useState([])
    const [activeNoteId, setActiveNoteId] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) loadNotes()
    }, [user])

    async function loadNotes() {
        setLoading(true)

        const { data, error } = await supabase
            .from("notes")
            .select("id, title, created_at, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })

        if (!error) {
            setNotes(data || [])
            setActiveNoteId(data?.[0]?.id ?? null)
        }

        setLoading(false)
    }

    async function handleDelete(noteId) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        setActiveNoteId((prev) => (prev === noteId ? null : prev))

        await supabase.from("notes").delete().eq("id", noteId)
    }

    function handleNoteUpdate(updatedNote) {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === updatedNote.id
                    ? { ...n, title: updatedNote.title, updated_at: updatedNote.updated_at }
                    : n
            )
        )
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                Loading...
            </div>
        )
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r flex flex-col">
                <CreateNoteButton
                    onCreate={(id) => {
                        setActiveNoteId(id)
                        loadNotes()
                    }}
                />

                <NotesList
                    notes={notes}
                    activeNoteId={activeNoteId}
                    onSelect={setActiveNoteId}
                />
            </div>

            {/* Viewer */}
            <NoteViewer
                noteId={activeNoteId}
                onDelete={handleDelete}
                onNoteUpdate={handleNoteUpdate}
            />
        </div>
    )
}