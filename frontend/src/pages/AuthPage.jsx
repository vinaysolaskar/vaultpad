import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

export default function AuthPage() {
    const [mode, setMode] = useState("login");

    return (
        <div className="min-h-screen bg-[#191919]">
            {mode === "login" ? (
                <LoginForm onSwitch={() => setMode("signup")} />
            ) : (
                <SignupForm onSwitch={() => setMode("login")} />
            )}
        </div>
    );
}