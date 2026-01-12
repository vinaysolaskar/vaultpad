import { supabase } from "../lib/supabase"
import { queueOperation } from "../hooks/useOfflineQueue"
import { saveNotesCache, removeNoteFromCache } from "./notes.cache"

const user = supabase.auth.getUser()

export async function fetchNotes(userId) {
  if (!navigator.onLine) return null;

  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("Supabase error caught:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    // This catch block prevents the "Network Error" popup
    console.error("Network fetch failed silently:", err);
    return null;
  }
}

export async function deleteNote(noteId) {
  removeNoteFromCache(noteId)

  if (!navigator.onLine) {
    queueOperation({ type: "delete", noteId })
    return
  }

  await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id)
}

export async function updateNote(noteId, payload) {
  if (!navigator.onLine) {
    queueOperation({ type: "update", noteId, payload })
    return null
  }

  const { data } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select("id, title, updated_at")
    .single()

  return data
}