import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

export default function NotesList({ onSelect }) {
    const { user } = useAuth()
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotes() {
            const { data, error } = await supabase
                .from("notes")
                .select("id, title, updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })

            if (!error) setNotes(data)
            setLoading(false)
        }

        fetchNotes()
    }, [user.id])

    if (loading) return <p className="p-4">Loading notes...</p>

    return (
        <div className="border-r w-64 overflow-y-auto">
            {notes.length === 0 && (
                <p className="p-4 text-sm text-gray-500">
                    No notes yet
                </p>
            )}

            {notes.map((note) => (
                <button
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
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