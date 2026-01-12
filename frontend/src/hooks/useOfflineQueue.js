import { useEffect } from "react"
import { supabase } from "../lib/supabase"

const QUEUE_KEY = "offline:queue"

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []
  } catch {
    return []
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function queueOperation(op) {
  const queue = loadQueue()
  if (op.type === "delete") {
    const createJob = queue.find(j => j.type === "create" && j.noteId === op.noteId);
    if (createJob) {
      saveQueue(queue.filter(j => j.noteId !== op.noteId));
      return;
    }
  }
  queue.push({ ...op, ts: Date.now() })
  saveQueue(queue)
}

export function useOfflineQueue(userId, onSyncSuccess) {
  useEffect(() => {
    async function flushQueue() {
      if (!navigator.onLine || !userId) return;

      const queue = loadQueue();
      if (queue.length === 0) return;

      const remaining = [];
      let didSync = false;

      for (const job of queue) {
        try {
          let result = null;

          if (job.type === "update") {
            result = await supabase.from("notes").update(job.payload).eq("id", job.noteId).eq("user_id", userId);
          }

          else if (job.type === "create") {
            const draft = JSON.parse(localStorage.getItem(`draft:${job.noteId}`) || "null");
            const finalPayload = {
              ...job.payload,
              title: draft?.title || job.payload.title || "",
              content: draft?.content || job.payload.content || ""
            };
            const { data, error } = await supabase.from("notes").insert(finalPayload).select("id").single();

            if (error) {
              if (error.code === '23505') {
                console.log("Note already exists, skipping create...");
              } else {
                throw error;
              }
            }

            if (data) {
              const realId = data.id;
              const tempId = job.noteId;

              // 1. Update Cache
              const cached = JSON.parse(localStorage.getItem("offline:notes") || "[]");
              const updatedCache = cached.map(n => n.id === tempId ? { ...n, id: realId } : n);
              localStorage.setItem("offline:notes", JSON.stringify(updatedCache));

              // 2. Update existing jobs in queue that use the old tempId
              const currentQueue = loadQueue();
              const updatedQueue = currentQueue.map(q => q.noteId === tempId ? { ...q, noteId: realId } : q);
              saveQueue(updatedQueue);

              // 3. Move Drafts
              const draft = localStorage.getItem(`draft:${tempId}`);
              if (draft) {
                localStorage.setItem(`draft:${realId}`, draft);
                localStorage.removeItem(`draft:${tempId}`);
              }
            }
            result = { error: null };
          }

          else if (job.type === "delete") {
            result = await supabase.from("notes").delete().eq("id", job.noteId).eq("user_id", userId);
            const cached = JSON.parse(localStorage.getItem("offline:notes") || "[]");
            localStorage.setItem("offline:notes", JSON.stringify(cached.filter(n => n.id !== job.noteId)));
            localStorage.removeItem(`draft:${job.noteId}`);
          }

          if (result?.error) throw result.error;
          didSync = true;
        } catch (err) {
          console.error("Queue job failed:", err);
          remaining.push(job);
        }
      }

      saveQueue(remaining);
      if (didSync && onSyncSuccess) onSyncSuccess();
    }

    window.addEventListener("online", flushQueue);
    const int = setInterval(flushQueue, 10000); // 10 seconds is safer
    flushQueue();

    return () => {
      window.removeEventListener("online", flushQueue);
      clearInterval(int);
    };
  }, [userId, onSyncSuccess]);
}