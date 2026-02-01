import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate('/browse', { state: { initialQuery: searchQuery } });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center pt-20">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-emerald-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 mb-8 animate-fade-in-up">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-gray-300">Powered by Advanced AI</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Your Personal AI Librarian
                    </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Experience a library that understands you. Ask for books naturally, get personalized recommendations, and track your reading journey.
                </p>

                {/* AI Search Bar */}
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl opacity-70 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative flex items-center bg-white dark:bg-[#1a1a1a] rounded-xl p-2 shadow-2xl border border-gray-100 dark:border-none">
                        <div className="p-3 text-gray-400">
                            <Search className="w-6 h-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Ask anything... e.g., 'Best sci-fi books for beginners'"
                            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 text-lg border-none focus:ring-0 px-2 py-2 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-black dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Ask AI</span>
                        </button>
                    </div>
                </div>

                {/* Quick Tags */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {['Python for Beginners', 'Space Exploration', 'History of India', 'Modern Philosophy'].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => navigate('/browse', { state: { initialQuery: tag } })}
                            className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 dark:text-gray-400 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
