import { supabase } from "../lib/supabase";
import { Menu, LogOut } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <header className="h-14 px-4 flex items-center justify-between bg-black border-b border-white/10 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button onClick={onToggleSidebar} className="p-2 md:hidden text-white">
                    <Menu size={20} />
                </button>
                <h1 className="text-white font-bold text-lg">Vaultpad<span className="text-blue-500">.</span></h1>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition"
            >
                <span className="hidden sm:inline">Logout</span>
                <LogOut size={16} />
            </button>
        </header>
    );
}