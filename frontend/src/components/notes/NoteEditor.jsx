import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useDebounce } from "../../hooks/useDebounce"
import { useOfflineDraft } from "../../hooks/useOfflineDraft"
import { queueOperation } from "../../hooks/useOfflineQueue"
import { useAuth } from "../../context/AuthContext"
import EditorFooter from "../EditorFooter"

export default function NoteEditor({ noteId, onDelete, onNoteUpdate }) {
    const { user } = useAuth()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("")

    const debouncedTitle = useDebounce(title, 600)
    const debouncedContent = useDebounce(content, 800)

    const lastSavedTitleRef = useRef("")
    const lastSavedContentRef = useRef("")
    const isHydratedRef = useRef(false)
    const savingRef = useRef(false)
    const { loadDraft, clearDraft, markHydrated } = useOfflineDraft(noteId, title, content)

    useEffect(() => {
        if (!noteId) return
        setLoading(true)
        isHydratedRef.current = false

        async function load() {
            const { data } = await supabase.from("notes").select("id, title, content").eq("id", noteId).eq("user_id", user.id).single()
            const draft = loadDraft()
            const finalTitle = draft?.title ?? data?.title ?? ""
            const finalContent = draft?.content ?? data?.content ?? ""

            setTitle(finalTitle)
            setContent(finalContent)
            lastSavedTitleRef.current = finalTitle
            lastSavedContentRef.current = finalContent
            markHydrated()
            isHydratedRef.current = true
            setIsEditing(false)
            setStatus("")
            setLoading(false)
        }

        load()
    }, [noteId])

    useEffect(() => {
        if (!isEditing || !isHydratedRef.current || !noteId) return
        const save = async (field, value) => {
            const lastRef = field === "title" ? lastSavedTitleRef : lastSavedContentRef
            if (value === lastRef.current) return

            if (!navigator.onLine) {
                queueOperation({
                    type: "update",
                    noteId,
                    payload: { [field]: value, updated_at: new Date().toISOString() },
                })
                lastRef.current = value
                setStatus("Offline (queued)")
                return
            }

            setStatus("Saving...")
            const { data, error } = await supabase.from("notes").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", noteId).select("id, title, updated_at").eq("user_id", user.id).single()
            if (!error && data) {
                lastRef.current = value
                clearDraft()
                onNoteUpdate(data)
                setStatus("Saved")
            }
        }

        save("title", debouncedTitle)
        save("content", debouncedContent)
    }, [debouncedTitle, debouncedContent])

    const forceSave = async () => {
        if (!isHydratedRef.current || savingRef.current || !noteId) return
        if (!navigator.onLine) {
            queueOperation({ type: "update", noteId, payload: { title, content, updated_at: new Date().toISOString() } })
            setStatus("Offline (queued)")
            return
        }

        savingRef.current = true
        setStatus("Saving...")
        const { data } = await supabase.from("notes").update({ title, content, updated_at: new Date().toISOString() }).eq("id", noteId).select("id, title, updated_at").eq("user_id", user.id).single()
        if (data) {
            lastSavedTitleRef.current = title
            lastSavedContentRef.current = content
            clearDraft()
            onNoteUpdate(data)
            setStatus("Saved")
        }
        savingRef.current = false
    }

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                forceSave()
            }
            if (e.key === "e") setIsEditing(true)
            if (e.key === "Escape") setIsEditing(false)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [title, content])

    if (!noteId) return <div className="flex-1 flex items-center justify-center text-gray-400">Select a note</div>
    if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>

    return (
        <div className="flex-1 p-6 flex flex-col">
            <input
                value={title}
                disabled={!isEditing}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isEditing ? "Add a Title" : "Untitled"}
                className="text-2xl p-3 font-semibold mb-4 outline-none"
            />
            <textarea
                value={content}
                readOnly={!isEditing}
                onChange={(e) => setContent(e.target.value)}
                className={`flex-1 p-3 resize-none outline-none ${isEditing ? "text-gray-800" : "text-gray-500"}`}
                placeholder={isEditing ? "Start writing..." : "Press Edit to modify"}
            />
            <EditorFooter isEditing={isEditing} status={status} onToggleEdit={() => setIsEditing(v => !v)} onDelete={() => onDelete(noteId)} />
        </div>
    )
}