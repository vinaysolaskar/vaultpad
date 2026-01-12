import { useEffect, useRef } from "react"

export function useOfflineDraft(noteId, title, content) {
  const key = noteId ? `draft:${noteId}` : null
  const hydratedRef = useRef(false)
  const activeNoteRef = useRef(noteId)

  if (activeNoteRef.current !== noteId) {
    activeNoteRef.current = noteId
    hydratedRef.current = false
  }

  function loadDraft() {
    if (!key) return null
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!key) return
    if (!hydratedRef.current) return

    localStorage.setItem(
      key,
      JSON.stringify({
        title,
        content,
        updatedAt: Date.now(),
      })
    )
  }, [key, title, content])

  function markHydrated() {
    hydratedRef.current = true
  }

  function clearDraft() {
    if (!key) return
    localStorage.removeItem(key)

    Object.keys(localStorage).forEach((k) => {
      if (!k.startsWith("draft:")) return
      try {
        const d = JSON.parse(localStorage.getItem(k))
        if (Date.now() - d.updatedAt > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(k)
        }
      } catch {}
    })
  }

  return { loadDraft, clearDraft, markHydrated }
}