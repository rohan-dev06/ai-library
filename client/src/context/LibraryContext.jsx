import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from './AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import PaymentModal from '../components/PaymentModal';

const LibraryContext = createContext();

export const useLibrary = () => useContext(LibraryContext);

export const LibraryProvider = ({ children }) => {
    const { user, token } = useAuth();

    // Initialize state from user profile if available, else defaults
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [coins, setCoins] = useState(1000);
    const [recommendations, setRecommendations] = useState([]); // Add recommendations state
    const [books, setBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(true);

    const fetchBooks = async () => {
        try {
            // No auth needed for public book list usually, but if needed add headers
            const res = await axios.get('/api/library/books');
            setBooks(res.data);
        } catch (error) {
            console.error("Failed to fetch books", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    // Sync with backend on load and periodic fine check
    useEffect(() => {
        let intervalId;

        const fetchUserData = async () => {
            if (token) {
                try {
                    const res = await axios.get('/api/library/dashboard', {
                        headers: { Authorization: token }
                    });
                    setCoins(res.data.coins);
                    setIssuedBooks(res.data.issuedBooks); // Store full objects
                    if (res.data.recommendations) setRecommendations(res.data.recommendations);
                } catch (error) {
                    console.error("Failed to fetch fresh user data", error);
                }
            } else {
                setCoins(1000);
                setIssuedBooks([]);
                setRecommendations([]);
            }
        };

        const syncFines = async () => {
            if (token) {
                try {
                    const res = await axios.post('/api/library/sync-fines', {}, {
                        headers: { Authorization: token }
                    });
                    setCoins(res.data.coins);
                    setIssuedBooks(res.data.issuedBooks); // Store full objects

                    // Also refresh books to update availability if auto-returned
                    if (res.data.autoReturned) {
                        fetchBooks();
                        toast.error(res.data.message, { id: 'zero-balance' });
                    }
                } catch (error) {
                    // Silent fail for background sync
                }
            }
        };

        fetchUserData();
        fetchBooks(); // Initial load of books

        // Start polling for fines if logged in
        if (token) {
            intervalId = setInterval(syncFines, 3000); // Check every 3s for real-time feel
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [token]);

    // Modal States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, book: null });
    const [paymentModal, setPaymentModal] = useState({ isOpen: false });

    // Note: We no longer sync to localStorage here, the backend is the source of truth.

    const issueBook = (book) => {
        if (!user) {
            toast.error("Please login to issue books.");
            return false;
        }

        if (!book.available) {
            toast.error(`"${book.title}" is currently unavailable.`);
            return false;
        }

        if (hasIssued(book.id)) {
            toast('You have already issued this book.', { icon: 'ℹ️' });
            return true;
        }

        // Check for sufficient coins (Frontend check for better UX)
        if (coins < 100) {
            toast.error("Insufficient coins! Please buy more.", { icon: '💰' });
            return false;
        }

        // Open Confirmation Modal
        setConfirmModal({ isOpen: true, book });
        return true;
    };

    const confirmIssue = async () => {
        const book = confirmModal.book;
        if (!book) return;

        try {
            const res = await axios.post('/api/library/issue',
                { bookId: book.id, bookTitle: book.title },
                { headers: { Authorization: token } }
            );

            // Update state from response
            setCoins(res.data.coins);
            setIssuedBooks(res.data.issuedBooks);

            // Refresh books availability
            fetchBooks();

            toast.success(res.data.message);

            // Close Modal
            setConfirmModal({ isOpen: false, book: null });

        } catch (error) {
            console.error("Issue Error:", error);
            const msg = error.response?.data?.message || "Failed to issue book.";
            toast.error(msg);
            setConfirmModal({ isOpen: false, book: null });
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, book: null });
    };

    const returnBook = async (bookId) => {
        try {
            const res = await axios.post('/api/library/return',
                { bookId },
                { headers: { Authorization: token } }
            );

            // Update state
            // If backend sends back IDs, use them. Or assuming sync from response.
            // Backend sends: { message, coins, issuedBooks: [ids] }
            setCoins(res.data.coins);
            // Handling legacy vs new if needed, but endpoint returns IDs now.
            setIssuedBooks(res.data.issuedBooks);

            // Refresh books availability
            fetchBooks();

            toast.success(res.data.message);
            return true;
        } catch (error) {
            console.error("Return Error:", error);
            const msg = error.response?.data?.message || "Failed to return book.";
            toast.error(msg);
            return false;
        }
    };

    const openPaymentModal = () => {
        setPaymentModal({ isOpen: true });
    };

    const handlePaymentSuccess = (newTotalCoins) => {
        // PaymentModal already handled the backend transaction
        // It returns the new total coin balance
        setCoins(newTotalCoins);
        setPaymentModal({ isOpen: false });
        // toast.success("Wallet updated!", { icon: '🪙' }); // Success toast already shown in modal
    };

    const hasIssued = (bookId) => {
        return issuedBooks.some(book => book.bookId === bookId);
    };

    return (
        <LibraryContext.Provider value={{ issuedBooks, coins, recommendations, issueBook, returnBook, openPaymentModal, hasIssued, books, loadingBooks }}>
            {children}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                book={confirmModal.book}
                balance={coins}
                onClose={closeConfirmModal}
                onConfirm={confirmIssue}
            />
            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false })}
                onSuccess={handlePaymentSuccess}
            />
        </LibraryContext.Provider>
    );
};
