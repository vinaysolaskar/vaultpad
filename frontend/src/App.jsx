import { useAuth } from "./context/AuthContext"
import AuthPage from "./pages/AuthPage"
import NotesLayout from "./components/notes/NotesLayout"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <NotesLayout />
}

export default App