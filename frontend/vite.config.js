import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    base: '/', // שנה לשם המאגר שלך
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.webmanifest is already hand-written and linked
            // directly in index.html - this only adds the service worker
            // (offline caching + Lighthouse's "installable" check) on top of it.
            manifest: false,
            includeAssets: ['icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og-image.png'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
            },
        }),
    ],
    server: {
        host: '0.0.0.0', // מאפשר גישה מכל כתובת IP
        port: 5173 // או כל פורט אחר שברצונך להשתמש בו
    }
})
