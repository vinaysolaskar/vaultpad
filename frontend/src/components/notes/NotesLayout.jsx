import { useEffect, useState } from "react"
import NotesList from "./NotesList"
import NoteViewer from "./NoteViewer"
import CreateNoteButton from "./CreateNoteButton"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"
import { queueOperation } from "../../hooks/useOfflineQueue"

export default function NotesLayout() {
    const { user } = useAuth()
    const [notes, setNotes] = useState([])
    const [activeNoteId, setActiveNoteId] = useState(null)
    const [loading, setLoading] = useState(true)

    const NOTES_CACHE_KEY = "offline:notes"

    function loadCachedNotes() {
        try {
            return JSON.parse(localStorage.getItem(NOTES_CACHE_KEY)) || []
        } catch {
            return []
        }
    }

    function saveCachedNotes(notes) {
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(notes))
    }

    useEffect(() => {
        if (user) loadNotes()
    }, [user])

    async function loadNotes() {
        setLoading(true)

        if (!navigator.onLine) {
            const cached = loadCachedNotes()
            setNotes(cached)
            setActiveNoteId(cached?.[0]?.id ?? null)
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from("notes")
            .select("id, title, created_at, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })

        if (!data && navigator.onLine) {
            clearDraft()
            setTitle("")
            setContent("")
            return
        }

        if (!error) {
            setNotes(data || [])
            setActiveNoteId(data?.[0]?.id ?? null)
            saveCachedNotes(data || [])
        }

        setLoading(false)
    }

    async function handleDelete(noteId) {
        setNotes((prev) => {
            const next = prev.filter((n) => n.id !== noteId)
            saveCachedNotes(next)
            return next
        })
        setActiveNoteId((prev) => (prev === noteId ? null : prev))
        localStorage.removeItem(`draft:${noteId}`)

        if (!navigator.onLine) {
            queueOperation({ type: "delete", noteId })
            return
        }

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

            <NoteViewer
                key={activeNoteId}
                noteId={activeNoteId}
                onDelete={handleDelete}
                onNoteUpdate={handleNoteUpdate}
            />
        </div>
    )
}