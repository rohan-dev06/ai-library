import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Sun, Moon, User, LogOut, ChevronDown, LayoutDashboard, Bookmark, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { coins, openPaymentModal } = useLibrary();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Close profile dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 group-hover:border-white/10 transition-colors">
                            <BookOpen className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                            LibrAI
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">Home</Link>
                        <Link to="/browse" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">Browse</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">Dashboard</Link>
                                {/* Links moved to dropdown for authenticated users, but kept some for quick access if needed */}
                            </>
                        )}

                        {/* Coin Wallet */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                                <span className="text-lg">🪙</span>
                                <span className="font-bold text-amber-700 dark:text-amber-500">{coins}</span>
                                <button
                                    onClick={openPaymentModal}
                                    className="ml-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        )}

                        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

                        <div className="flex items-center space-x-4">


                            {isAuthenticated ? (
                                <div className="relative profile-dropdown">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user?.username || 'User'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Member</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Signed in as</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-blue-500" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/saved-books"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <Bookmark className="w-4 h-4 text-purple-500" />
                                                    Saved Books
                                                </Link>
                                                <Link
                                                    to="/history"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <History className="w-4 h-4 text-emerald-500" />
                                                    History
                                                </Link>
                                            </div>
                                            <div className="p-2 border-t border-gray-100 dark:border-white/5">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsProfileOpen(false);
                                                        navigate('/');
                                                    }}
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                                    Sign In
                                </Link>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute w-full bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    <Link to="/" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5">Home</Link>
                    <Link to="/browse" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Browse</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/dashboard" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Dashboard</Link>
                            <Link to="/saved-books" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Saved Books</Link>
                            <Link to="/history" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">History</Link>
                        </>
                    )}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
                        {isAuthenticated ? (
                            <button onClick={() => {
                                logout();
                                setIsOpen(false);
                                navigate('/');
                            }} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-center rounded-lg text-base font-medium bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
