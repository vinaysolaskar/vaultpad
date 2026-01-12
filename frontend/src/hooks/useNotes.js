import { useEffect, useState, useRef, useCallback } from "react"
import { loadNotesCache, removeNoteFromCache, saveNotesCache } from "../data/notes.cache"
import { fetchNotes, deleteNote } from "../data/notes.service"
import { useOfflineQueue, queueOperation } from "./useOfflineQueue"
import { supabase } from "../lib/supabase"

export function useNotes(user) {
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true); // Ref to track if we've loaded once

  const loadData = useCallback(async () => {
    if (!user) return;

    // 1. Load from Cache FIRST (Synchronous)
    const cached = loadNotesCache();
    if (cached?.length > 0) {
      setNotes(cached);
    }

    // 2. If Online, fetch from DB
    if (navigator.onLine) {
      const data = await fetchNotes(user.id);
      if (data) {
        setNotes(data);
        saveNotesCache(data);
      }
    }

    setLoading(false);
    isInitialLoad.current = false;
  }, [user?.id]);

  useOfflineQueue(user?.id, loadData);

  useEffect(() => {
    if (user && isInitialLoad.current) {
      loadData();
    }
  }, [user, loadData]);

  // Ensure 'create' is ONLY manual
  async function create() {
    const tempId = crypto.randomUUID();
    const newNote = { id: tempId, title: "", user_id: user.id, updated_at: new Date().toISOString() };

    setNotes(prev => [newNote, ...prev]);
    setActiveId(tempId);

    // Save to cache so a refresh doesn't lose the temp note
    const currentCache = loadNotesCache();
    saveNotesCache([newNote, ...currentCache]);

    if (!navigator.onLine) {
      queueOperation({
        type: "create",
        noteId: tempId,
        payload: { id: tempId, user_id: user.id, title: "", content: "" }
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, title: "", content: "" })
        .select("id")
        .single();

      if (data) {
        setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: data.id } : n));
        setActiveId(data.id);
        saveNotesCache(loadNotesCache().map(n => n.id === tempId ? { ...n, id: data.id } : n));
      }
    } catch (err) {
      queueOperation({ type: "create", noteId: tempId, payload: { user_id: user.id } });
    }
  }

  async function remove(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);

    removeNoteFromCache(id);
    localStorage.removeItem(`draft:${id}`);

    if (!navigator.onLine) {
      queueOperation({ type: "delete", noteId: id });
      return;
    }

    await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
  }

  return {
    notes,
    activeId,
    setActiveId,
    create,
    remove,
    loading,
    setNotes
  }
}