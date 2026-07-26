// Formats an ISO timestamp as a short relative Hebrew phrase for activity lists
// ("today"/"yesterday"/"N days ago"), falling back to a plain date past a week.
export const formatRelativeDate = (isoString) => {
    if (!isoString) return ''
    const then = new Date(isoString)
    const now = new Date()
    const dayMs = 24 * 60 * 60 * 1000
    const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) / dayMs)

    if (diffDays <= 0) return 'היום'
    if (diffDays === 1) return 'אתמול'
    if (diffDays < 7) return `לפני ${diffDays} ימים`
    return then.toLocaleDateString('he-IL')
}
