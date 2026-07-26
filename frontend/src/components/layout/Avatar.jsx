import PropTypes from 'prop-types';

// Shows the user's photo when one exists (Google sign-in only - this app has
// no Firebase Storage/upload path, stays on the free Spark plan per CLAUDE.md),
// else a colored circle with their name's first letter instead of a generic icon.
const Avatar = ({ photoURL, name, size = 32 }) => {
    if (photoURL) {
        return (
            <img
                src={photoURL}
                alt={name}
                referrerPolicy="no-referrer"
                className="app-avatar"
                style={{ width: size, height: size }}
            />
        );
    }

    const initial = name?.trim()?.[0]?.toUpperCase() || '?';
    return (
        <span className="app-avatar app-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.44 }}>
            {initial}
        </span>
    );
};

Avatar.propTypes = {
    photoURL: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.number,
};

export default Avatar;
