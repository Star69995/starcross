import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { login as apiLogin, loginWithGoogle as apiLoginWithGoogle, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase restores the signed-in user asynchronously on page load;
        // this fires once immediately with the restored state (or null),
        // then again on every login/logout.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setUser(firebaseUser ? await getCurrentUser() : null);
            } catch (error) {
                console.error('Error loading user profile:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await apiLogin(email, password);
            // onAuthStateChanged will fire and populate `user`; also fetch
            // here so callers awaiting login() see the user immediately.
            const userData = await getCurrentUser();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            await apiLoginWithGoogle();
            const userData = await getCurrentUser();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await apiRegister(userData);

            // reuse login flow to ensure user is set correctly
            return await login(userData.email, userData.password);

        } catch (error) {
            console.error("Registration error:", error.message);
            throw new Error(error.message || "Registration failed");
        }
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};