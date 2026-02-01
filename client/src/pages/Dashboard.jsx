import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Clock, AlertCircle, BookOpen, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const { token, user } = useAuth();
    const { returnBook, coins, issuedBooks, loadingBooks, recommendations } = useLibrary(); // Get live data including recommendations
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your library AI assistant. How can I help you find a book today?", sender: 'ai' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    // Derived State for Dashboard
    const totalFines = issuedBooks.reduce((sum, book) => sum + (book.totalFinePaid || 0), 0);

    // Process books to add status for display
    const processedBooks = issuedBooks.map(book => {
        // Calculate status dynamically
        const dueDate = new Date(book.dueDate);
        const now = new Date();
        const isOverdue = now > dueDate;

        // Calculate days/minutes left or overdue
        // Just for display purposes

        return {
            ...book,
            status: isOverdue ? 'Overdue' : 'Active',
            fine: book.totalFinePaid || 0
        };
    });




    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // User Message
        const userMsg = { id: Date.now(), text: newMessage, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        // Mock AI Response
        setTimeout(() => {
            let aiText = "I can help you browse our collection. Try asking about 'sci-fi' or 'trending' books.";
            const lowerMsg = userMsg.text.toLowerCase();

            if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                aiText = "Hi there! Looking for a good read?";
            } else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest')) {
                aiText = "Based on your activity, I recommend checking out 'The Great Gatsby' or 'Dune'.";
            } else if (lowerMsg.includes('fine') || lowerMsg.includes('due') || lowerMsg.includes('coin')) {
                aiText = `You currently have ${totalFines} coins in fine records.`;
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
        }, 1000);
    };

    if (loadingBooks) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white font-sans transition-colors duration-300 pb-20">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">

                {/* Header & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">Currently Issued</h3>
                        </div>
                        <p className="text-4xl font-extrabold">{issuedBooks.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Active items in your library</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Pending Fines</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-500">{totalFines} Coins</span>
                            <span className="text-sm text-gray-500">Payable on Return</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Due to overdue books</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-400">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">Your Balance</h3>
                        </div>
                        <p className="text-4xl font-extrabold text-yellow-500">{coins} Coins</p>
                        <p className="text-sm text-gray-500 mt-1">Available to spend</p>
                    </div>
                </div>

                {/* Issued Books List */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">📚 Your Issued Books</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {processedBooks.length === 0 ? (
                            <p className="text-gray-500">You haven't issued any books yet.</p>
                        ) : (
                            processedBooks.map((book, index) => (
                                <div key={index} className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 transition-transform hover:scale-[1.01]">
                                    <Link to={`/book/${book.bookId}`} className="flex items-center gap-4 flex-1 group cursor-pointer">
                                        {/* Book Image */}
                                        <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                                            {book.image ? (
                                                <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500">No Img</div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors">{book.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Due: {new Date(book.dueDate).toLocaleDateString()}
                                                </span>
                                                {/* Add simplified fine/status display */}
                                                {book.status === 'Overdue' && (
                                                    <span className="text-red-500 font-bold px-2 py-0.5 bg-red-500/10 rounded-md">
                                                        Overdue ({book.fine} coins fine)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation(); // Prevent navigation when clicking return
                                            const success = await returnBook(book.bookId);
                                            // Context updates automatically
                                        }}
                                        className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors flex-shrink-0 z-10">
                                        Return Book
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">🎯 Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map(book => (
                            <div key={book.id} className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center">
                                {book.image && (
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="w-32 h-48 object-cover rounded-lg shadow-md mb-4"
                                    />
                                )}
                                <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{book.reason}</p>
                                <Link to={`/book/${book.id}`} className="text-blue-500 font-semibold hover:underline inline-block">View Details →</Link>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* AI Assistant Chatbot Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                {isChatOpen ? (
                    <div className="bg-white dark:bg-[#1e1e1e] w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> AI Assistant
                            </h3>
                            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded">✕</button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-white/10">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
