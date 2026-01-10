import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useDebounce } from "../../hooks/useDebounce"

export default function NoteViewer({ noteId, onDelete }) {
    const [note, setNote] = useState(null)
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("")
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    const debouncedContent = useDebounce(content)

    const lastSavedContentRef = useRef("")
    const savingRef = useRef(false)

    const draftKey = `draft-${noteId}`

    /* -----------------------------
       Force save (Ctrl + S)
    ------------------------------ */
    async function forceSave() {
        if (!noteId) return
        if (savingRef.current) return
        if (content === lastSavedContentRef.current) return

        // Offline → store locally
        if (!navigator.onLine) {
            localStorage.setItem(draftKey, content)
            setStatus("Saved locally")
            return
        }

        savingRef.current = true
        setStatus("Saving...")

        const { error } = await supabase
            .from("notes")
            .update({
                content,
                updated_at: new Date().toISOString(),
            })
            .eq("id", noteId)

        if (!error) {
            lastSavedContentRef.current = content
            localStorage.removeItem(draftKey)
            setStatus("Saved")
        }

        savingRef.current = false
    }

    /* -----------------------------
       Network status
    ------------------------------ */
    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    /* -----------------------------
       Load note
    ------------------------------ */
    useEffect(() => {
        if (!noteId) return

        async function loadNote() {
            setLoading(true)

            const localDraft = localStorage.getItem(draftKey)

            const { data } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

            setNote(data)
            setContent(localDraft ?? data.content)
            lastSavedContentRef.current = data.content

            setLoading(false)
        }

        loadNote()
    }, [noteId])

    /* -----------------------------
       Autosave (debounced)
    ------------------------------ */
    useEffect(() => {
        if (!noteId || !note) return

        // Always persist draft locally
        localStorage.setItem(draftKey, debouncedContent)

        if (debouncedContent === lastSavedContentRef.current) return
        if (savingRef.current) return

        async function save() {
            if (!isOnline) {
                setStatus("Saved locally")
                return
            }

            savingRef.current = true
            setStatus("Saving...")

            const { error } = await supabase
                .from("notes")
                .update({
                    content: debouncedContent,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)

            if (!error) {
                lastSavedContentRef.current = debouncedContent
                localStorage.removeItem(draftKey)
                setNote((n) => ({ ...n, content: debouncedContent }))
                setStatus("Saved")
            }

            savingRef.current = false
        }

        save()
    }, [debouncedContent, isOnline])

    /* -----------------------------
       Sync on reconnect
    ------------------------------ */
    useEffect(() => {
        if (!isOnline || !noteId) return

        const localDraft = localStorage.getItem(draftKey)
        if (!localDraft) return

        if (localDraft === lastSavedContentRef.current) {
            localStorage.removeItem(draftKey)
            return
        }

        async function syncDraft() {
            if (savingRef.current) return

            savingRef.current = true
            setStatus("Syncing...")

            const { error } = await supabase
                .from("notes")
                .update({
                    content: localDraft,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)

            if (!error) {
                lastSavedContentRef.current = localDraft
                setContent(localDraft)
                localStorage.removeItem(draftKey)
                setStatus("Saved")
            }

            savingRef.current = false
        }

        syncDraft()
    }, [isOnline, noteId])

    /* -----------------------------
       Keyboard shortcuts
    ------------------------------ */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                forceSave()
            }

            if (e.key === "Escape") {
                document.activeElement?.blur()
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
                e.preventDefault()
                if (window.confirm("Delete this note?")) {
                    onDelete(noteId)
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [noteId, content])

    /* -----------------------------
       UI
    ------------------------------ */
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