import { supabase } from "../lib/supabase"

export default function Navbar() {
    async function handleLogout() {
        await supabase.auth.signOut()
        // AuthContext will handle redirect automatically
    }

    return (
        <header className="h-12 px-4 flex items-center justify-between bg-black border-b border-gray-800">
            <h1 className="text-sm font-semibold text-white">
                Vaultpad
            </h1>

            <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition"
            >
                Logout
            </button>
        </header>
    )
}