import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap's CSS must load before index.css/App.css (pulled in indirectly via
// App.jsx below) so the design system's overrides win the cascade on equal
// specificity without needing !important on every single rule.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { AuthProvider } from './providers/AuthContext'
import { CrosswordProvider } from './providers/CrosswordContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CrosswordProvider>
        <App />
      </CrosswordProvider>
    </AuthProvider>
  </StrictMode>,
)