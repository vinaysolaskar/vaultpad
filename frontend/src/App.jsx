import { useAuth } from "./context/AuthContext"
import AuthPage from "./pages/AuthPage"
import NotesLayout from "./components/notes/NotesLayout"
import Navbar from "./components/Navbar"
import { useOfflineQueue } from "./hooks/useOfflineQueue"

function App() {
  const { user, loading } = useAuth()

  useOfflineQueue()

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

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <NotesLayout />
      </div>
    </div>
  )
}

export default App