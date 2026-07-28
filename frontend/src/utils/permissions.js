export const isAdmin = (user) => user?.role === 'admin'

export const canManage = (user, creatorId) =>
    Boolean(user) && (user._id === creatorId || isAdmin(user))
