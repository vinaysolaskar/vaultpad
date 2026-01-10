import { useAuth } from "./context/AuthContext"
import AuthPage from "./pages/AuthPage"

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Authenticated – notes coming next</p>
    </div>
  )
}

export default App