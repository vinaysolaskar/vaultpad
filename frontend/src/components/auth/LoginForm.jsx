import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function LoginForm({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) setError(error.message);
        setLoading(false);
    }

    async function handleGoogleLogin() {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
        });
    }

    return (
        <div className="min-h-screen bg-[#191919] flex items-center justify-center p-6 text-[#EBEBEB]">
            {/* Added Bordered Container to match Signup */}
            <div className="w-full max-w-sm bg-[#202020] border border-[#2F2F2F] rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Vaultpad<span className="text-blue-500">.</span></h1>
                    <p className="text-gray-500 mt-2 text-sm">Welcome back to your workspace</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-[#191919] border border-[#2F2F2F] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-[#191919] border border-[#2F2F2F] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-xs text-red-500 font-bold uppercase">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#EBEBEB] text-black font-bold py-3 rounded-lg hover:bg-white transition-all active:scale-[0.98]"
                    >
                        {loading ? "AUTHENTICATING..." : "LOG IN"}
                    </button>
                </form>

                <div className="flex items-center gap-4 py-6">
                    <div className="h-[1px] flex-1 bg-[#2F2F2F]"></div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">OR</span>
                    <div className="h-[1px] flex-1 bg-[#2F2F2F]"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-transparent border border-[#2F2F2F] py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-[#191919] transition-all font-medium text-sm"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    Continue with Google
                </button>

                <div className="mt-8 text-center border-t border-[#2F2F2F] pt-6">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                        New here?
                        <button
                            type="button"
                            onClick={onSwitch}
                            className="text-blue-500 hover:underline ml-1 outline-none"
                        >
                            Create Account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}