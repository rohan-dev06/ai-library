import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';


import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useLibrary } from '../context/LibraryContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

// BookRating Component
const BookRating = ({ bookId }) => {
    const [rating, setRating] = useState({ average: 0, total: 0 });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                console.log('Fetching reviews for bookId:', bookId);
                const res = await axios.get(`/api/reviews/${bookId}`);
                console.log('Reviews response:', res.data);
                const reviews = res.data;
                if (reviews.length > 0) {
                    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                    console.log('Calculated average:', avg);
                    setRating({ average: avg.toFixed(1), total: reviews.length });
                } else {
                    console.log('No reviews found for book', bookId);
                }
            } catch (error) {
                console.error('Error fetching rating:', error);
            }
        };
        fetchRating();
    }, [bookId]);

    return (
        <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 text-sm font-medium">
            <span>★</span>
            <span>{rating.average > 0 ? rating.average : 'N/A'}</span>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const { hasIssued, issueBook, books } = useLibrary();

    const handleAction = (e, book) => {
        e.stopPropagation();

        if (hasIssued(book.id)) {
            // Already issued -> Read
            navigate(`/read/${book.id}`);
        } else {
            // Not issued -> Try to issue
            if (issueBook(book)) {
                // Determine if we auto-open or just show toast? 
                // Context shows toast. Let's just update UI state.
            }
        }
    };
    return (
        <div className="min-h-screen bg-white dark:bg-[#242424] text-gray-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
            <Navbar />
            <HeroSection />

            {/* Featured Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trending Now</h2>
                        <p className="text-gray-600 dark:text-gray-400">Most popular books in the community this week</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20 transition-all font-medium">
                        View All
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => navigate(`/book/${book.id}`)}
                            className="group relative bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/50 cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="aspect-[2/3] relative overflow-hidden">
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="px-2 py-1 text-xs font-bold rounded bg-white/90 dark:bg-black/60 backdrop-blur text-blue-600 dark:text-white border border-white/20 dark:border-white/10 shadow-sm">
                                        AI Match: {book.match}
                                    </span>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 p-6 backdrop-blur-[2px]">
                                    <button
                                        onClick={(e) => handleAction(e, book)}
                                        className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transform scale-95 group-hover:scale-100 transition-all duration-300 ${hasIssued(book.id)
                                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                                            }`}
                                    >
                                        {hasIssued(book.id) ? 'Read Now' : 'Issue Now'}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.id}`); }}
                                        className="w-full py-3 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 rounded-xl text-gray-900 dark:text-white font-semibold backdrop-blur border border-gray-200 dark:border-white/10 transform scale-95 group-hover:scale-100 transition-all duration-300 delay-75 shadow-lg"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{book.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{book.author}</p>
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${book.available
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10'
                                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/10'
                                        }`}>
                                        {book.available ? 'Available' : 'Reserved'}
                                    </span>
                                    <BookRating bookId={book.id} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Home;
