import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useDebounce } from "../../hooks/useDebounce"

export default function NoteViewer({ noteId, onDelete }) {
    const [note, setNote] = useState(null)
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("")

    const debouncedContent = useDebounce(content)

    // Load note
    useEffect(() => {
        if (!noteId) return

        async function loadNote() {
            setLoading(true)

            const localDraft = localStorage.getItem(`draft-${noteId}`)

            const { data } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

            setNote(data)
            setContent(localDraft ?? data.content)
            setLoading(false)
        }

        loadNote()
    }, [noteId])

    // Autosave (debounced)
    useEffect(() => {
        if (!noteId || !note) return
        if (debouncedContent === note.content) return

        async function save() {
            setStatus("Saving...")

            // Offline → save locally
            if (!navigator.onLine) {
                localStorage.setItem(`draft-${noteId}`, debouncedContent)
                setStatus("Saved locally")
                return
            }

            const { error } = await supabase
                .from("notes")
                .update({
                    content: debouncedContent,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)

            if (!error) {
                localStorage.removeItem(`draft-${noteId}`)
                setNote((n) => ({ ...n, content: debouncedContent }))
                setStatus("Saved")
            }
        }

        save()
    }, [debouncedContent])

    if (!noteId) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a note
            </div>
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
        <div className="flex-1 p-6 flex flex-col">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full resize-none outline-none text-gray-800"
                placeholder="Start writing..."
            />

            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>{status}</span>

                <button
                    onClick={() => onDelete(note.id)}
                    className="text-red-600 hover:underline"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}