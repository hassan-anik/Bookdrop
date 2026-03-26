import React, { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, auth, doc, updateDoc, getDoc, runTransaction } from '../firebase';
import { X, Star, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewModalProps {
  targetUserId: string;
  targetUserName: string;
  bookId: string;
  onClose: () => void;
}

export default function ReviewModal({ targetUserId, targetUserName, bookId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || rating === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Add the review
      await addDoc(collection(db, 'reviews'), {
        reviewerId: auth.currentUser.uid,
        reviewerName: auth.currentUser.displayName || 'Anonymous',
        revieweeId: targetUserId,
        bookId,
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // 2. Update user's average rating using a transaction
      const userRef = doc(db, 'users', targetUserId);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }

        const userData = userDoc.data();
        const currentRating = userData.rating || 0;
        const currentCount = userData.ratingCount || 0;

        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        transaction.update(userRef, {
          rating: newRating,
          ratingCount: newCount
        });
      });

      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shadow-sm">
              <Star size={20} className="fill-yellow-600" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h2 className="text-xl font-serif italic text-stone-900">Leave a Review</h2>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">For {targetUserName}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-stone-400 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">How was your exchange?</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={32} 
                    className={`transition-colors ${
                      star <= (hoveredRating || rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-stone-200"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Add a comment (Optional)</label>
            <textarea 
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Friendly, punctual, book in great condition..."
              className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all resize-none text-sm"
            />
          </div>

          {error && (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} />
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-stone-900/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <MessageCircle size={18} />
                Submit Review
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
