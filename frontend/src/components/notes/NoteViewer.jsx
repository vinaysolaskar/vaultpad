import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useDebounce } from "../../hooks/useDebounce"
import { useOfflineDraft } from "../../hooks/useOfflineDraft"
import EditorFooter from "../EditorFooter"

export default function NoteViewer({ noteId, onDelete, onNoteUpdate }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("")

    const debouncedContent = useDebounce(content)

    const lastSavedRef = useRef("")
    const savingRef = useRef(false)

    const {
        loadDraft,
        clearDraft,
        markHydrated,
    } = useOfflineDraft(noteId, title, content)

    /* =========================
       Load note (safe hydration)
    ========================== */
    useEffect(() => {
        if (!noteId) return

        async function load() {
            setLoading(true)

            const { data } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

            const draft = loadDraft()

            setTitle(draft?.title ?? data?.title ?? "")
            setContent(draft?.content ?? data?.content ?? "")
            lastSavedRef.current = data?.content ?? ""

            markHydrated()
            setIsEditing(false)
            setLoading(false)
        }

        load()
    }, [noteId])

    async function saveTitle() {
        const { data, error } = await supabase
            .from("notes")
            .update({
                title,
                updated_at: new Date().toISOString(),
            })
            .eq("id", noteId)
            .select("id, title, updated_at")
            .single()

        if (!error && data) {
            onNoteUpdate(data)
        }
    }


    /* =========================
       Autosave (online only)
    ========================== */
    useEffect(() => {
        if (!isEditing) return
        if (debouncedContent === lastSavedRef.current) return

        async function save() {
            if (!navigator.onLine) {
                setStatus("Offline")
                return
            }

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
                clearDraft()
                setStatus("Saved")
            }
        }

        save()
    }, [debouncedContent, isEditing])

    /* =========================
       Sync when internet returns
    ========================== */
    useEffect(() => {
        async function syncOnReconnect() {
            if (!navigator.onLine || !noteId) return

            const draft = loadDraft()
            if (!draft) return

            setStatus("Syncing...")

            const { data } = await supabase
                .from("notes")
                .update({
                    title: draft.title,
                    content: draft.content,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)
                .select("id, title, updated_at")
                .single()

            if (data) {
                lastSavedRef.current = draft.content
                clearDraft()
                onNoteUpdate(data)
                setStatus("Saved")
            }
        }

        window.addEventListener("online", syncOnReconnect)
        return () =>
            window.removeEventListener("online", syncOnReconnect)
    }, [noteId])

    /* =========================
       Ctrl + S (hard save)
    ========================== */
    useEffect(() => {
        function handler(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                forceSave()
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [title, content])

    async function forceSave() {
        if (!navigator.onLine) {
            setStatus("Offline")
            return
        }

        if (savingRef.current) return
        savingRef.current = true

        setStatus("Saving...")

        const { data } = await supabase
            .from("notes")
            .update({
                title,
                content,
                updated_at: new Date().toISOString(),
            })
            .eq("id", noteId)
            .select("id, title, updated_at")
            .single()

        if (data) {
            lastSavedRef.current = content
            clearDraft()
            onNoteUpdate(data)
            setStatus("Saved")
        }

        savingRef.current = false
    }

    /* =========================
       Edit mode shortcuts
    ========================== */
    useEffect(() => {
        function handler(e) {
            if (e.key === "e") setIsEditing(true)
            if (e.key === "Escape") setIsEditing(false)
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    /* =========================
       Render
    ========================== */
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
                disabled={!isEditing}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                    isEditing ? "Add a Title" : "Untitled"
                }
                onBlur={saveTitle}
                className="text-2xl p-3 font-semibold mb-4 outline-none"
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

            <EditorFooter
                isEditing={isEditing}
                status={status}
                onToggleEdit={() => setIsEditing(v => !v)}
                onDelete={() => onDelete(noteId)}
            />
        </div>
    )
}