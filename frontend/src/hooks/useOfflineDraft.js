import { useEffect, useRef } from "react"

export function useOfflineDraft(noteId, title, content) {
  const key = noteId ? `draft:${noteId}` : null
  const hydratedRef = useRef(false)

  // Load once
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

  // Save only AFTER hydration
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
  }

  return { loadDraft, clearDraft, markHydrated }
}