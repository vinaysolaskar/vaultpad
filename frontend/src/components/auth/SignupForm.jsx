import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SignupForm({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSignup(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) setError(error.message)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#191919] flex items-center justify-center p-6 text-[#EBEBEB]">
            {/* Bordered Container */}
            <div className="w-full max-w-sm bg-[#202020] border border-[#2F2F2F] rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Vaultpad<span className="text-blue-500">.</span></h1>
                    <p className="text-gray-500 mt-2 text-sm">Create your private workspace</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
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
                        {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-[#2F2F2F] pt-6">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                        Already have an account?
                        <button
                            type="button"
                            onClick={onSwitch}
                            className="text-blue-500 hover:underline ml-1 outline-none"
                        >
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}