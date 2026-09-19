import { useCallback, useEffect, useState } from 'react'

// Wraps the browser's `beforeinstallprompt` event so the Navbar can offer a
// custom "install app" action instead of relying on visitors to find each
// browser's own install affordance. Chromium-based browsers (desktop
// Chrome/Edge, Android Chrome) only - iOS Safari never fires this event, so
// canInstall stays false there and iOS visitors keep using the native
// Share > "הוספה למסך הבית" flow (already supported via the apple-mobile-web-app-*
// meta tags in index.html).
export const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(
        () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
    )

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault()
            setDeferredPrompt(event)
        }
        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            setIsInstalled(true)
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setDeferredPrompt(null)
    }, [deferredPrompt])

    return { canInstall: Boolean(deferredPrompt) && !isInstalled, promptInstall }
}
