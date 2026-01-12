const NOTES_KEY = "offline:notes"

export function loadNotesCache() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || []
  } catch {
    return []
  }
}

export function saveNotesCache(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export function removeNoteFromCache(noteId) {
  const notes = loadNotesCache().filter(n => n.id !== noteId)
  saveNotesCache(notes)
}

export function clearDraft(noteId) {
  localStorage.removeItem(`draft:${noteId}`)
}