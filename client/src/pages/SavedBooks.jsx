import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import Navbar from '../components/Navbar';
import { Heart, Trash2, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SavedBooks = () => {
    const { books } = useLibrary();
    const navigate = useNavigate();
    const [savedBooks, setSavedBooks] = useState([]);

    useEffect(() => {
        const savedIds = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        setSavedBooks(savedIds);
    }, []);

    const handleRemove = (bookId) => {
        const updated = savedBooks.filter(id => id !== bookId);
        localStorage.setItem('savedBooks', JSON.stringify(updated));
        setSavedBooks(updated);
        toast.success('Removed from saved books');
    };

    const savedBookDetails = savedBooks.map(id => books.find(b => b.id === id)).filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Heart className="w-8 h-8 text-red-500 fill-current" />
                        Saved Books Collection
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {savedBookDetails.length} {savedBookDetails.length === 1 ? 'book' : 'books'} saved
                    </p>
                </div>

                {savedBookDetails.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No saved books yet</p>
                        <p className="text-gray-400 dark:text-gray-500">Browse books and click the Save button to add them here!</p>
                        <Link
                            to="/"
                            className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {savedBookDetails.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => navigate(`/book/${book.id}`)}
                                className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                                />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold hover:text-blue-500 transition-colors">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {book.author}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{book.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${book.available
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                            }`}>
                                            {book.available ? 'Available' : 'Reserved'}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{book.category}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(book.id);
                                    }}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-xl font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedBooks;
