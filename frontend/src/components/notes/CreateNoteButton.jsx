import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

export default function CreateNoteButton({ onCreate }) {
    const { user } = useAuth()

    async function createNote() {
        const { data, error } = await supabase
            .from("notes")
            .insert({
                user_id: user.id,
                title: "",
                content: "",
            })
            .select("id")
            .single()

        if (!error) onCreate(data.id)
    }

    return (
        <button
            onClick={createNote}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b"
        >
            + New note
        </button>
    )
}