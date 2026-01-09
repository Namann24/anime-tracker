import { useState } from 'react';
import { FaTrash, FaStar, FaQuoteLeft, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { deleteReview } from '../../services/adminService';

export default function ReviewControl({ reviews, setReviews, isLoading }) {
    const [filter, setFilter] = useState('');

    const handleDelete = async (reviewId) => {
        if (!window.confirm("CONFIRM: Expunge this testimonial record?")) return;

        // Optimistic Update
        const prevReviews = [...reviews];
        setReviews(reviews.filter(r => r._id !== reviewId));

        try {
            await deleteReview(reviewId);
            toast.success("Record expunged", { icon: '🗑️' });
        } catch (error) {
            console.error(error);
            setReviews(prevReviews);
            toast.error("Failed to delete record");
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.content.toLowerCase().includes(filter.toLowerCase()) ||
        review.user?.username?.toLowerCase().includes(filter.toLowerCase()) ||
        review.animeTitle?.toLowerCase().includes(filter.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-[#080a0f] border border-white/5 rounded-xl">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="SEARCH ARCHIVES..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 pl-10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors uppercase tracking-wider"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* FEED */}
            <div className="space-y-4">
                {filteredReviews.map(review => (
                    <div key={review._id} className="relative bg-[#0a0a0f] border border-white/5 p-6 rounded-xl hover:bg-[#0f0f16] transition-colors group">
                        <div className="flex gap-4">
                            {/* Score Box */}
                            <div className={`shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-lg border ${review.rating >= 8 ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                                <span className="text-lg font-black">{review.rating}</span>
                                <FaStar className="w-2 h-2 opacity-50" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-white uppercase tracking-wide">{review.animeTitle || "Unknown Archive"}</span>
                                        <span className="text-[10px] text-gray-500 font-mono">by {review.user?.username || "Unknown"}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>

                                <p className="text-xs text-gray-300 leading-relaxed font-light relative pl-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10"></div>
                                    {review.content}
                                </p>

                                {/* Spoilers Badge */}
                                {review.isSpoiler && (
                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-900/20 border border-red-900/30 text-red-500 text-[9px] uppercase font-black tracking-wider">
                                        <FaExclamationTriangle className="w-2 h-2" /> Spoiler
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => handleDelete(review._id)}
                                className="self-start p-2 text-gray-600 hover:text-red-500 bg-transparent hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Record"
                            >
                                <FaTrash className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <FaQuoteLeft className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-mono uppercase">No Testimonials Found</p>
                </div>
            )}
        </div>
    );
}
