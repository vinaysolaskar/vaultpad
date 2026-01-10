import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function NoteViewer({ noteId, onDelete }) {
    const [note, setNote] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!noteId) return

        async function fetchNote() {
            const { data, error } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

            if (!error) setNote(data)
            setLoading(false)
        }

        fetchNote()
    }, [noteId])

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
        <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold mb-4">
                {note.title || "Untitled"}
            </h2>

            <pre className="whitespace-pre-wrap text-gray-800">
                {note.content}
            </pre>

            <button
                onClick={() => onDelete(note.id)}
                className="mt-6 text-sm text-red-600 hover:underline"
            >
                Delete note
            </button>
        </div>
    )
}