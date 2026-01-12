import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { supabase } from "./lib/supabase"
import { AuthProvider } from "./context/AuthContext"
import { BrowserRouter } from "react-router-dom"

window.supabase = supabase

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)