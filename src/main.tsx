import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AnimalProvider } from './context/AnimalContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimalProvider>
      <App />
    </AnimalProvider>
  </StrictMode>,
)
