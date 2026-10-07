import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Last line of defence: without it, any render error unmounts the whole
        app and the user is left with a blank page. */}
    <ErrorBoundary title="Neki hit an unexpected problem">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
