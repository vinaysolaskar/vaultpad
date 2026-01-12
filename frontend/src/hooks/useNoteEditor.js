import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "./useDebounce";
import { useOfflineDraft } from "./useOfflineDraft";
import { queueOperation } from "./useOfflineQueue";

export function useNoteEditor(noteId, onNoteUpdate) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const debouncedTitle = useDebounce(title, 600);
  const debouncedContent = useDebounce(content, 800);

  const lastSavedTitleRef = useRef("");
  const lastSavedContentRef = useRef("");
  const isHydratedRef = useRef(false);
  const savingRef = useRef(false);

  const { loadDraft, clearDraft, markHydrated } = useOfflineDraft(noteId, title, content);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    isHydratedRef.current = false;

    async function load() {
      if (!navigator.onLine) {
        const draft = loadDraft();
        const cached = loadNotesCache().find(n => n.id === noteId);
        setTitle(draft?.title || cached?.title || "");
        setContent(draft?.content || cached?.content || "");
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("notes").select("id, title, content").eq("id", noteId).eq("user_id", user.id).single();
      const draft = loadDraft();
      const finalTitle = draft?.title ?? data?.title ?? "";
      const finalContent = draft?.content ?? data?.content ?? "";

      setTitle(finalTitle);
      setContent(finalContent);
      lastSavedTitleRef.current = finalTitle;
      lastSavedContentRef.current = finalContent;
      markHydrated();
      isHydratedRef.current = true;
      setIsEditing(false);
      setStatus("");
      setLoading(false);
    }
    load();
  }, [noteId]);

  useEffect(() => {
    if (!isEditing || !isHydratedRef.current || !noteId) return;

    const save = async (field, value) => {
      const lastRef = field === "title" ? lastSavedTitleRef : lastSavedContentRef;
      if (value === lastRef.current) return;

      if (!navigator.onLine) {
        queueOperation({
          type: "update",
          noteId,
          payload: { [field]: value, user_id: user.id, updated_at: new Date().toISOString() },
        });
        lastRef.current = value;
        setStatus("Offline (queued)");
        return;
      }

      setStatus("Saving...");
      const { data, error } = await supabase.from("notes").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", noteId).eq("user_id", user.id).select("id, title, updated_at").eq("user_id", user.id).single();
      if (!error && data) {
        lastRef.current = value;
        clearDraft();
        onNoteUpdate(data);
        setStatus("Saved");
      }
    };

    save("title", debouncedTitle);
    save("content", debouncedContent);
  }, [debouncedTitle, debouncedContent]);

  // Force Save & Keyboard Shortcuts
  const forceSave = async () => {
    if (!isHydratedRef.current || savingRef.current || !noteId) return;
    if (!navigator.onLine) {
      queueOperation({ type: "update", noteId, payload: { title, content, updated_at: new Date().toISOString() } });
      setStatus("Offline (queued)");
      return;
    }

    savingRef.current = true;
    setStatus("Saving...");
    const { data } = await supabase.from("notes").update({ title, content, updated_at: new Date().toISOString() }).eq("id", noteId).select("id, title, updated_at").eq("user_id", user.id).single();
    if (data) {
      lastSavedTitleRef.current = title;
      lastSavedContentRef.current = content;
      clearDraft();
      onNoteUpdate(data);
      setStatus("Saved");
    }
    savingRef.current = false;
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
      if (e.key === "e") setIsEditing(true);
      if (e.key === "Escape") setIsEditing(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [title, content]);

  return { title, setTitle, content, setContent, isEditing, setIsEditing, status, loading };
}