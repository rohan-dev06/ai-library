import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, BookOpen, Star, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import SmartSearchBar from '../components/SmartSearchBar';
import axios from 'axios';

const Browse = () => {
    const { books, hasIssued, issueBook, loadingBooks } = useLibrary();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [filteredBooks, setFilteredBooks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setFilteredBooks(books);
    }, [books]);

    const categories = ['All', 'Fiction', 'Science', 'Technology', 'Philosophy', 'Business'];

    const handleSmartSearch = async ({ query, file, type }) => {
        setIsSearching(true);
        setAiAnalysis(null);

        try {
            const formData = new FormData();
            if (query) formData.append('query', query);
            if (file) formData.append('image', file);
            formData.append('type', type);

            const res = await axios.post('/api/library/search/smart', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFilteredBooks(res.data.results);
            setAiAnalysis(res.data.analysis);

            if (res.data.results.length === 0) {
                toast("No books found matching your smart search.", { icon: '🤖', id: 'smart-search-fail' });
            } else {
                toast.success(`Found ${res.data.results.length} smart matches!`, { id: 'smart-search-success' });
            }

        } catch (error) {
            console.error("Smart Search Error", error);
            toast.error("Smart search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    // Trigger Initial Search if from Hero
    useEffect(() => {
        if (location.state?.initialQuery) {
            handleSmartSearch({ query: location.state.initialQuery, type: 'text' });
            // Clear state to prevent re-search on refresh/remount
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);


    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setAiAnalysis(null); // Clear AI context on manual filter
        if (category === 'All') {
            setFilteredBooks(books);
        } else {
            setFilteredBooks(books.filter(book => book.tags.includes(category)));
        }
    };

    const handleAction = (e, book) => {
        e.stopPropagation();
        if (hasIssued(book.id)) {
            navigate(`/read/${book.id}`);
        } else {
            if (issueBook(book)) {
                // Toast handled by context
            }
        }
    };

    if (loadingBooks) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white font-sans transition-colors duration-300">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Header & Smart Search */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Universe</span> of Books
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Use our AI-powered search to find books by voice, image, or natural language. Try "Books for beginners" or upload a cover!
                    </p>

                    <SmartSearchBar onSearch={handleSmartSearch} loading={isSearching} />

                    {/* AI Feedback Area */}
                    {aiAnalysis && (
                        <div className="flex flex-col items-center gap-2 animate-fadeIn">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium border border-blue-500/20">
                                <Sparkles className="w-3 h-3" />
                                AI Detected Intent: <span className="text-white">"{aiAnalysis.category || aiAnalysis.keywords.join(', ') || 'General Search'}"</span>
                            </div>
                            {aiAnalysis.category && (
                                <p className="text-xs text-gray-400">Filtered for category: {aiAnalysis.category}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white dark:bg-[#1e1e1e] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => navigate(`/book/${book.id}`)}
                                className="group bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-white/5 relative"
                            >
                                {/* Image Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10 pointer-events-none" />

                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Availability Badge */}
                                    <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-md text-xs font-bold shadow-md ${book.available ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                                        }`}>
                                        {book.available ? 'Available' : 'Reserved'}
                                    </div>
                                </div>

                                <div className="p-5 relative z-20">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{book.title}</h3>
                                    <p className="text-sm text-gray-400 mb-3">{book.author}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {book.tags.slice(0, 2).map((tag, i) => (
                                            <span key={i} className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={(e) => handleAction(e, book)}
                                        className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${hasIssued(book.id)
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                            : book.available
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {hasIssued(book.id) ? (
                                            <>
                                                <BookOpen className="w-4 h-4" /> Read Now
                                            </>
                                        ) : (
                                            <>
                                                {book.available ? 'Issue Book' : 'Unavailable'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl">No books found matching criteria.</p>
                            <button onClick={() => { setFilteredBooks(books); setAiAnalysis(null); }} className="mt-4 text-blue-500 hover:underline">Clear Search</button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Browse;
