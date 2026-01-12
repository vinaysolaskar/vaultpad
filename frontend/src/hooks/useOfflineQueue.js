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
  queue.push({ ...op, ts: Date.now() })
  saveQueue(queue)
}

export function useOfflineQueue() {
  useEffect(() => {
    async function flushQueue() {
      if (!navigator.onLine) return

      const queue = loadQueue()
      if (queue.length === 0) return

      const remaining = []

      for (const job of queue) {
        try {
          if (job.type === "update") {
            await supabase
              .from("notes")
              .update(job.payload)
              .eq("id", job.noteId)
          }

          if (job.type === "delete") {
            await supabase
              .from("notes")
              .delete()
              .eq("id", job.noteId)

            const cached = JSON.parse(localStorage.getItem("offline:notes") || "[]")
            localStorage.setItem("offline:notes",
                JSON.stringify(cached.filter(n => n.id !== job.noteId))
            )

            localStorage.removeItem(`draft:${job.noteId}`) 
          }
        } catch {
          remaining.push(job)
        }
      }

      saveQueue(remaining)
    }

    window.addEventListener("online", flushQueue)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            flushQueue()
        }
    })
    setInterval(flushQueue, 5000)
    flushQueue()

    return () => window.removeEventListener("online", flushQueue)
  }, [])
}