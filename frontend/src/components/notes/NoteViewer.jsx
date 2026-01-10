import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useDebounce } from "../../hooks/useDebounce"
import EditorFooter from "../EditorFooter"

export default function NoteViewer({ noteId, onDelete }) {
    const [note, setNote] = useState(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("")

    const debouncedContent = useDebounce(content)
    const lastSavedRef = useRef("")

    /* Load note */
    useEffect(() => {
        if (!noteId) return

        async function load() {
            setLoading(true)

            const { data } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

            setNote(data)
            setTitle(data.title)
            setContent(data.content)
            lastSavedRef.current = data.content
            setIsEditing(false)
            setLoading(false)
        }

        load()
    }, [noteId])

    async function saveTitle() {
        await supabase
            .from("notes")
            .update({ title })
            .eq("id", noteId)
    }

    /* Autosave only when editing */
    useEffect(() => {
        if (!isEditing) return
        if (debouncedContent === lastSavedRef.current) return

        async function save() {
            setStatus("Saving...")

            const { error } = await supabase
                .from("notes")
                .update({
                    content: debouncedContent,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)

            if (!error) {
                lastSavedRef.current = debouncedContent
                setStatus("Saved")
            }
        }

        save()
    }, [debouncedContent, isEditing])

    /* Keyboard shortcuts */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "e") setIsEditing(true)
            if (e.key === "Escape") setIsEditing(false)
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    if (!noteId) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
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
            <input
                value={title}
                placeholder={
                    isEditing ? "Add a Title" : "Untitled"
                }
                disabled={!isEditing}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                className="text-2xl p-3 font-semibold mb-4 outline-none color-gray"
            />
            <textarea
                value={content}
                readOnly={!isEditing}
                onChange={(e) => setContent(e.target.value)}
                className={`flex-1 p-3 resize-none outline-none ${isEditing ? "text-gray-800" : "text-gray-500"
                    }`}
                placeholder={
                    isEditing ? "Start writing..." : "Press Edit to modify"
                }
            />

            {/* <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>{isEditing ? status : "Read only"}</span>

                <div className="space-x-4">
                    <button
                        onClick={() => setIsEditing((v) => !v)}
                        className="hover:underline"
                    >
                        {isEditing ? "Done" : "Edit"}
                    </button>

                    <button
                        onClick={() => onDelete(note.id)}
                        className="text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </div> */}
            <EditorFooter
                isEditing={isEditing}
                status={status}
                onToggleEdit={() => setIsEditing((v) => !v)}
                onDelete={() => onDelete(note.id)}
            />
        </div>
    )
}