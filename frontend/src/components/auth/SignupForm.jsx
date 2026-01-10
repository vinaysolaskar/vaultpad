import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function SignupForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

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
        <form onSubmit={handleSignup} className="space-y-3">
            <input
                type="email"
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                className="w-full border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
                {loading ? "Creating account..." : "Sign up"}
            </button>
        </form>
    )
}