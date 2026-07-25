import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/', // שנה לשם המאגר שלך
    plugins: [react()],
    server: {
        host: '0.0.0.0', // מאפשר גישה מכל כתובת IP
        port: 5173 // או כל פורט אחר שברצונך להשתמש בו
    }
})
