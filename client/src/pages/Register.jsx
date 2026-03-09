import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
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
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
                    Create Account
                </h2>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition duration-200 font-semibold disabled:bg-blue-400"
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
