import { useState, useEffect, useRef } from "react"
import { updateNote } from "../data/notes.service"
import { useOfflineDraft } from "./useOfflineDraft"
import { useDebounce } from "./useDebounce"

export function useNoteEditor(noteId, onUpdate) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("")
  const [editing, setEditing] = useState(false)

  const { loadDraft, clearDraft, markHydrated } =
    useOfflineDraft(noteId, title, content)

  const debouncedTitle = useDebounce(title, 600)
  const debouncedContent = useDebounce(content, 800)

  const hydrated = useRef(false)

  useEffect(() => {
    if (!noteId) return

    async function hydrate() {
      const draft = loadDraft()
      setTitle(draft?.title || "")
      setContent(draft?.content || "")
      markHydrated()
      hydrated.current = true
    }

    hydrate()
  }, [noteId])

  useEffect(() => {
    if (!editing || !hydrated.current) return
    updateNote(noteId, { title: debouncedTitle }).then((data) => {
      if (data) {
        clearDraft()
        onUpdate(data)
        setStatus("Saved")
      }
    })
  }, [debouncedTitle])

  useEffect(() => {
    if (!editing || !hydrated.current) return
    updateNote(noteId, { content: debouncedContent })
  }, [debouncedContent])

  return {
    title,
    setTitle,
    content,
    setContent,
    editing,
    setEditing,
    status
  }
}