import { useMemo, useState } from 'react'
import Admin from './admin/Admin.jsx'
import TestAPI from './admin/TestAPI.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'

function App() {
  const [hasEntered, setHasEntered] = useState(false)

  const route = useMemo(() => {
    const path = window.location.pathname
    const hash = window.location.hash
    
    if (path === '/test' || hash === '#/test' || /[?&]test=1/.test(window.location.search)) {
      return 'test'
    }
    return 'admin'
  }, [])

  // Show welcome screen if user hasn't entered yet
  if (!hasEntered) {
    return <WelcomeScreen onEnter={() => setHasEntered(true)} />
  }

  if (route === 'test') return <TestAPI />
  return <Admin />
}

export default App
