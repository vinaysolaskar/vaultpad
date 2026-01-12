import { useEffect, useState } from "react"
import { loadNotesCache } from "../data/notes.cache"
import { fetchNotes, deleteNote } from "../data/notes.service"

export function useNotes(user) {
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      setLoading(true)

      if (!navigator.onLine) {
        const cached = loadNotesCache()
        setNotes(cached)
        setActiveId(cached[0]?.id ?? null)
      } else {
        const data = await fetchNotes(user.id)
        setNotes(data)
        setActiveId(data[0]?.id ?? null)
      }

      setLoading(false)
    }

    load()
  }, [user])

  async function remove(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
    setActiveId(prev => (prev === id ? null : prev))
    await deleteNote(id)
  }

  return {
    notes,
    activeId,
    setActiveId,
    remove,
    loading,
    setNotes
  }
}