import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, User, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewSection = ({ bookId, onStatsUpdate }) => {
    const { token, isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`/api/reviews/${bookId}`);
            setReviews(res.data);

            // Calculate stats
            if (res.data.length > 0) {
                const total = res.data.length;
                const sum = res.data.reduce((acc, curr) => acc + curr.rating, 0);
                const average = (sum / total).toFixed(1);

                const newStats = { average, total };
                setStats(newStats);

                // Pass stats to parent
                if (onStatsUpdate) {
                    onStatsUpdate(newStats);
                }

                // Check for user's review
                if (user) {
                    const userReview = res.data.find(r => r.userId === user.userId || r.userId === user._id);
                    if (userReview) {
                        setNewReview({ rating: userReview.rating, comment: userReview.comment });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load reviews", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [bookId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to write a review");
            return;
        }
        if (!newReview.comment.trim()) {
            toast.error("Please allow us to know your thoughts!");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/reviews/add', {
                bookId,
                rating: newReview.rating,
                comment: newReview.comment
            }, {
                headers: { Authorization: token }
            });

            toast.success(res.data.message || "Review posted!");
            // Remove reset to allow user to see their updated review
            // setNewReview({ rating: 5, comment: '' }); 
            fetchReviews();
        } catch (error) {
            toast.error("Failed to post review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 max-w-4xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span>Reviews</span>
                <span className="text-base font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                    {stats.total}
                </span>
            </h3>

            {/* Input Area */}
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-8">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Write a Review</h4>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= (hoverRating || newReview.rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white rounded-xl p-4 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-black focus:outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="What did you think about this book?"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">Please <span className="text-blue-500 font-semibold cursor-pointer">login</span> to leave a review.</p>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-gray-50 dark:bg-[#1a1a1a]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-[#1a1a1a] hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {review.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-200">{review.username}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-gray-300 dark:text-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-13 ml-13">
                            {review.comment}
                        </p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#1a1a1a]/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                        <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
                            <Send className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
