import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { username, email, role, ... }
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // In a real app, verify token validity with backend here
            // For now, we trust the token exists and maybe decode it if we had a library
            // Since we don't have a /me endpoint yet, we might rely on localStorage user data or just token presence
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, [token]);

    const register = async (formData) => {
        try {
            const res = await axios.post('/api/auth/register', formData);
            return { success: true, data: res.data };
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp });

            const { token, user } = res.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            setIsAuthenticated(true);

            toast.success('Verification successful! Logged in.');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
            return false;
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            const { token, user } = res.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            setIsAuthenticated(true);

            toast.success('Logged in successfully');
            return { success: true, user };
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out');
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            return false;
        }
    };

    const verifyPasswordOtp = async (email, otp) => {
        try {
            const res = await axios.post('/api/auth/verify-pass-otp', { email, otp });
            toast.success('OTP Verified');
            return { success: true, resetToken: res.data.resetToken };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            return { success: false };
        }
    };

    const resetPassword = async (resetToken, newPassword) => {
        try {
            const res = await axios.post('/api/auth/reset-password', { resetToken, newPassword });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            register,
            verifyOtp,
            login,
            logout,
            forgotPassword,
            verifyPasswordOtp,
            resetPassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
