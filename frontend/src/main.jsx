import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { supabase } from "./lib/supabase"
import { AuthProvider } from "./context/AuthContext"

window.supabase = supabase

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)