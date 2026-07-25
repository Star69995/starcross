// Short synthesized chime (no audio asset needed) played when a definition is
// answered correctly. Uses the Web Audio API directly since this is a single
// two-tone beep, not worth shipping/loading an audio file for.
export const playCorrectSound = () => {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        const ctx = new AudioContextClass()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        oscillator.frequency.setValueAtTime(1175, ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.start()
        oscillator.stop(ctx.currentTime + 0.3)
        oscillator.onended = () => ctx.close()
    } catch (error) {
        console.error('Could not play sound:', error)
    }
}
