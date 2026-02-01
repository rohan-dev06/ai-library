import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Mail, MapPin, Phone, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await axios.post('/api/newsletter/subscribe', { email });
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-white/10 pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 group mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                LibrAI
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            Your intelligent companion for exploring the world of books.
                            Powered by advanced algorithms to deliver personalized reading experiences.
                        </p>
                        <div className="flex items-center space-x-4">
                            {[Github, Twitter, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {['Home', 'Browse Books', 'My Dashboard', 'About Us'].map((item) => (
                                <li key={item}>
                                    <Link
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-all"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                <span>123 Library Avenue,<br />Knowledge City, KC 45000</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                                <a href="mailto:hello@librai.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">hello@librai.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-6">Newsletter</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Subscribe to get the latest book updates and AI features.
                        </p>
                        <form className="space-y-3" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
                                    </>
                                ) : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        © {new Date().getFullYear()} LibrAI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
