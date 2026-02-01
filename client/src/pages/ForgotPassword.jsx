import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const { forgotPassword, verifyPasswordOtp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await forgotPassword(email);
        setLoading(false);
        if (success) setStep(2);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await verifyPasswordOtp(email, otp);
        setLoading(false);
        if (res.success) {
            setResetToken(res.resetToken);
            setStep(3);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await resetPassword(resetToken, newPassword);
        setLoading(false);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-gray-400 text-center mb-4">
                            Enter your email to receive a password reset OTP.
                        </p>
                        <div>
                            <label className="block mb-1 text-gray-300">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition duration-200 font-semibold disabled:bg-blue-800"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-gray-400 text-center mb-4">
                            Enter the OTP sent to {email}
                        </p>
                        <div>
                            <label className="block mb-1 text-gray-300">OPT Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded transition duration-200 font-semibold disabled:bg-green-800"
                        >
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full py-2 text-gray-400 hover:text-white"
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-gray-400 text-center mb-4">
                            Set a new password for your account.
                        </p>
                        <div>
                            <label className="block mb-1 text-gray-300">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition duration-200 font-semibold disabled:bg-purple-800"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="mt-4 text-center text-gray-400">
                    Remember it? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
