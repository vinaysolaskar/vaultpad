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

    const debouncedTitle = useDebounce(title, 600)
    const debouncedContent = useDebounce(content, 800)

    const lastSavedTitleRef = useRef("")
    const lastSavedContentRef = useRef("")
    const isHydratedRef = useRef(false)
    const savingRef = useRef(false)

    const { loadDraft, clearDraft, markHydrated } =
        useOfflineDraft(noteId, title, content)

    /* =========================
       Load note (safe hydration)
    ========================== */
    useEffect(() => {
        if (!noteId) return

        async function load() {
            setLoading(true)
            isHydratedRef.current = false

            const { data } = await supabase
                .from("notes")
                .select("id, title, content")
                .eq("id", noteId)
                .single()

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
            setLoading(false)
        }

        load()
    }, [noteId])

    /* =========================
       Autosave TITLE
    ========================== */
    useEffect(() => {
        if (!isEditing) return
        if (!isHydratedRef.current) return
        if (debouncedTitle === lastSavedTitleRef.current) return
        if (!navigator.onLine) {
            setStatus("Offline")
            return
        }

        async function saveTitle() {
            setStatus("Saving...")
            const { data } = await supabase
                .from("notes")
                .update({
                    title: debouncedTitle,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", noteId)
                .select("id, title, updated_at")
                .single()

            if (data) {
                lastSavedTitleRef.current = debouncedTitle
                clearDraft()
                onNoteUpdate(data)
                setStatus("Saved")
            }
        }

        saveTitle()
    }, [debouncedTitle])

    /* =========================
       Autosave CONTENT
    ========================== */
    useEffect(() => {
        if (!isEditing) return
        if (!isHydratedRef.current) return
        if (debouncedContent === lastSavedContentRef.current) return
        if (!navigator.onLine) {
            setStatus("Offline")
            return
        }

        async function saveContent() {
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
                clearDraft()
                setStatus("Saved")
            }
        }

        saveContent()
    }, [debouncedContent])

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
        if (!isHydratedRef.current) return
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
            lastSavedTitleRef.current = title
            lastSavedContentRef.current = content
            clearDraft()
            onNoteUpdate(data)
            setStatus("Saved")
        }

        savingRef.current = false
    }

    /* =========================
       Edit shortcuts
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
                placeholder={isEditing ? "Add a Title" : "Untitled"}
                className="text-2xl p-3 font-semibold mb-4 outline-none"
            />

            <textarea
                value={content}
                readOnly={!isEditing}
                onChange={(e) => setContent(e.target.value)}
                className={`flex-1 p-3 resize-none outline-none ${isEditing ? "text-gray-800" : "text-gray-500"
                    }`}
                placeholder={isEditing ? "Start writing..." : "Press Edit to modify"}
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