import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBook, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const AdminNavbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                        LibrAI Admin
                    </h1>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                        {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                    </button>
                </div>

                {/* Desktop Right Side */}
                <div className="hidden md:flex items-center space-x-6">
                    <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                        <FaUserCircle className="text-gray-500 text-xl" />
                        <span className="text-gray-700 font-medium">Current User: {user?.username}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition duration-200 font-semibold"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 bg-gray-50 rounded-lg p-4 shadow-inner flex flex-col space-y-4">
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <FaUserCircle className="text-gray-500 text-xl" />
                        <span className="text-gray-700 font-medium break-all">{user?.username}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition duration-200 font-semibold w-full"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default AdminNavbar;
