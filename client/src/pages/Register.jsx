import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Register Form, 2: OTP
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await register(formData);
        setLoading(false);

        if (res.success) {
            toast.success(res.data.message);
            if (res.data.roleDetected) {
                toast(`AI Detected Role: ${res.data.roleDetected.toUpperCase()}`, { icon: '🤖' });
            }
            setStep(2);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await verifyOtp(formData.email, otp);
        setLoading(false);

        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">
                    {step === 1 ? 'Create Account' : 'Verify Identity'}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-gray-300">Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-300">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-300">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition duration-200 font-semibold disabled:bg-blue-800"
                        >
                            {loading ? 'Processing...' : 'Register'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <p className="text-gray-400 text-center mb-4">
                            Enter the OTP sent to {formData.email}
                        </p>
                        <div>
                            <label className="block mb-1 text-gray-300">One Time Password</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
                                placeholder="123456"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded transition duration-200 font-semibold disabled:bg-green-800"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full py-2 text-gray-400 hover:text-white"
                        >
                            Back to Register
                        </button>
                    </form>
                )}

                <p className="mt-4 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
