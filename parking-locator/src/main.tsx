import React from 'react'
import ReactDOM from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './style.css'
import App from './App'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
