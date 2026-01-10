import { useState } from "react"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/SignupForm"

export default function AuthPage() {
    const [mode, setMode] = useState("login")

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    Vaultpad
                </h1>

                {mode === "login" ? <LoginForm /> : <SignupForm />}

                <div className="mt-4 text-center text-sm">
                    {mode === "login" ? (
                        <button
                            onClick={() => setMode("signup")}
                            className="text-blue-600 hover:underline"
                        >
                            Create an account
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode("login")}
                            className="text-blue-600 hover:underline"
                        >
                            Already have an account
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}