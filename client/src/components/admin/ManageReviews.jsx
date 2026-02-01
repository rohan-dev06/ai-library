import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, Search, Star } from 'lucide-react';

const ManageReviews = () => {
    const { token } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReviews = async () => {
        try {
            const res = await axios.get('/api/admin/reviews', {
                headers: { Authorization: token }
            });
            setReviews(res.data);
        } catch (error) {
            toast.error("Failed to load reviews");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await axios.delete(`/api/admin/reviews/${reviewId}`, {
                headers: { Authorization: token }
            });
            toast.success("Review deleted");
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(review.bookId).includes(searchTerm)
    );

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span>⭐</span> Manage Reviews
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search user, comment, book ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-400 py-8">Loading reviews...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                <th className="pb-3 pl-4">Book ID</th>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Rating</th>
                                <th className="pb-3 w-1/3">Comment</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="py-4 pl-4 text-blue-400 font-medium">#{review.bookId}</td>
                                        <td className="py-4 text-gray-300">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{review.username}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-400 text-sm truncate max-w-xs" title={review.comment}>
                                            {review.comment}
                                        </td>
                                        <td className="py-4 text-gray-500 text-xs">
                                            {new Date(review.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No reviews found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;
