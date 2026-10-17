import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/fraunces/latin-400.css'
import '@fontsource/fraunces/latin-400-italic.css'
import '@fontsource/fraunces/latin-500.css'
import '@fontsource/fraunces/latin-500-italic.css'
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/fraunces/latin-700.css'
import '@fontsource/literata/latin-400.css'
import '@fontsource/literata/latin-400-italic.css'
import '@fontsource/literata/latin-500.css'
import '@fontsource/literata/latin-600.css'
import '@fontsource/literata/latin-700.css'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { initApiBase } from './api/apiBase'

// Localhost primero (2,5s de margen), si no el dominio de producción.
initApiBase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  )
})