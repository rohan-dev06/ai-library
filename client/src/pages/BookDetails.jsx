import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Book, Clock, Globe, Share2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { hasIssued, issueBook, books, loadingBooks } = useLibrary();
    const { isAuthenticated } = useAuth();
    const book = books.find(b => b.id === parseInt(id));
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [progress, setProgress] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    // Check if book is saved on mount
    useEffect(() => {
        if (book) {
            const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
            setIsSaved(savedBooks.includes(book.id));
        }
    }, [book]);

    useEffect(() => {
        if (!loadingBooks && !book) {
            toast.error("Book not found!");
            navigate('/');
            return;
        }
        if (book) {
            setStats({ average: 0, total: 0 }); // Will be updated by ReviewSection

            // Fetch progress if logged in
            if (isAuthenticated) {
                // We need to fetch progress from API since user object might be stale or not contain it detailed
                // Actually, user object in context *could* have it if we synced it.
                // But let's fetch fresh to be sure.
                // OR we can just use a useEffect to fetch it.
            }
        }
        window.scrollTo(0, 0);
    }, [book, loadingBooks, navigate, isAuthenticated]);

    // Fetch Progress separately
    useEffect(() => {
        const fetchProgress = async () => {
            if (isAuthenticated && book) {
                try {
                    // Import axios if not imported... wait check imports
                    // We need axios. Let's assume it's imported or I will need to check imports.
                    // Checking imports... imports are at top. I need to make sure axios is imported.
                    // It is NOT in the current file view. I should probably add it or use a helper.
                    // Actually, I'll add axios import in a separate step if needed, but wait, ReviewSection uses it.
                    // BookDetails doesn't seem to have axios import.
                    // I will check imports first.
                } catch (e) { console.error(e); }
            }
        };
    }, []);

    if (loadingBooks) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!book) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl text-red-500">Book not found!</h2>
                <p>Requested ID: {id}</p>
                <p>Total Books Loaded: {books.length}</p>
                <div className="mt-4 p-4 bg-gray-800 rounded">
                    <p>Available IDs: {books.map(b => b.id).join(', ')}</p>
                </div>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-400">Go Home</button>
            </div>
        );
    }

    const handleAction = () => {
        // If it's an E-book, go directly to read page if logged in
        if (book.bookType === 'EBOOK') {
            if (!isAuthenticated) {
                toast.error("Please login to read books.");
                navigate('/login', { state: { from: location } });
                return;
            }

            if (hasIssued(book.id)) {
                // If already issued, go to reader
                navigate(`/read/${book.id}`);
            } else {
                // If not issued, trigger issue flow (opens modal)
                // Note: user must verify/pay coins as per standard flow
                issueBook(book);
            }
            return;
        }

        // Existing logic for physical books
        if (hasIssued(book.id)) {
            navigate(`/read/${book.id}`);
        } else {
            if (!isAuthenticated) {
                toast.error("Please login to issue books.");
                navigate('/login', { state: { from: location } });
                return;
            }
            issueBook(book);
        }
    };

    const handleSave = () => {
        // Save to localStorage as a simple wishlist
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');

        if (savedBooks.includes(book.id)) {
            // Remove from saved
            const updated = savedBooks.filter(id => id !== book.id);
            localStorage.setItem('savedBooks', JSON.stringify(updated));
            setIsSaved(false);
            toast.success('Removed from saved books');
        } else {
            // Add to saved
            savedBooks.push(book.id);
            localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
            setIsSaved(true);
            toast.success('Saved to your collection!');
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;

        if (navigator.share) {
            // Use native share if available
            try {
                await navigator.share({
                    title: book.title,
                    text: `Check out "${book.title}" by ${book.author}`,
                    url: shareUrl
                });
                toast.success('Shared successfully!');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share error:', error);
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            } catch (error) {
                toast.error('Failed to copy link');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300 font-sans">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Browse
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Image */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <img
                                src={book.image}
                                alt={book.title}
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="flex gap-4 mt-6 w-full max-w-sm">
                            <button
                                onClick={handleSave}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isSaved
                                    ? 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400'
                                    : 'bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button onClick={handleShare} className="flex-1 py-3 px-4 rounded-xl bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center gap-2 transition-all">
                                <Share2 className="w-5 h-5" /> Share
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex gap-2 mb-4">
                                    {book.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-2">
                                    {book.title}
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">by {book.author}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-6 h-6 fill-current" />
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.average > 0 ? stats.average : 'N/A'}</span>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{stats.total} reviews</span>
                            </div>
                        </div>

                        {/* Availability Badge */}
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg border mb-8 ${book.available
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${book.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="font-semibold">{book.available ? 'Available' : 'Unavailable'}</span>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Synopsis</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {book.description}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 border-y border-gray-200 dark:border-white/10 py-8">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                    <Book className="w-4 h-4" /> Format
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">{book.bookType === 'EBOOK' ? 'E-Book' : 'Hardcover'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Language
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">{book.language}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Pages
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">{book.pages}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Match</p>
                                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{book.match}</p>
                            </div>
                        </div>

                        {/* Action - Issue Button */}
                        <button
                            onClick={handleAction}
                            disabled={!book.available && !hasIssued(book.id)}
                            className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 ${hasIssued(book.id)
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                                : book.available
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {hasIssued(book.id)
                                ? (progress && progress.lastPage > 1
                                    ? `Continue reading from page ${progress.lastPage}`
                                    : 'Read Book Now')
                                : book.bookType === 'EBOOK'
                                    ? 'Read Now' // Direct read for E-books
                                    : book.available ? 'Issue Book Now' : 'Notify When Available'
                            }
                        </button>

                        {/* Reviews Section */}
                        <ReviewSection bookId={book.id} onStatsUpdate={setStats} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
