import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, doc, getDoc, deleteDoc } from '../firebase';
import { UserProfile, BookListing, Review } from '../types';
import { X, Star, BookOpen, Award, ShieldCheck, MapPin, User, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<BookListing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch Profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }

        // Fetch Books
        const booksQuery = query(collection(db, 'books'), where('ownerId', '==', userId));
        const booksSnapshot = await getDocs(booksQuery);
        const booksData = booksSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as BookListing));
        setBooks(booksData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));

        // Fetch Reviews
        const reviewsQuery = query(collection(db, 'reviews'), where('revieweeId', '==', userId));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
        setReviews(reviewsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
        setBooks(books.filter(b => b.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-stone-400">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const givenCount = profile.givenCount || books.length;
  const rating = profile.rating || (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0);
  const ratingCount = profile.ratingCount || reviews.length;

  const isTopDonor = givenCount >= 5;
  const isTrustedNeighbor = rating >= 4.5 && ratingCount >= 3;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white hover:bg-stone-100 shadow-sm rounded-full transition-all text-stone-400 hover:text-stone-900 z-10">
            <X size={20} />
          </button>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full pt-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-stone-100 border-4 border-white shadow-xl overflow-hidden shrink-0 flex items-center justify-center">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={48} className="text-stone-300" />
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-stone-900">{profile.displayName}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mt-1">
                  <MapPin size={12} />
                  <span>Local Member</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isTopDonor && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-amber-200/50">
                    <Award size={14} />
                    Top Donor
                  </div>
                )}
                {isTrustedNeighbor && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-200/50">
                    <ShieldCheck size={14} />
                    Trusted Neighbor
                  </div>
                )}
                {!isTopDonor && !isTrustedNeighbor && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-stone-200">
                    <User size={14} />
                    Community Member
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-900">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-2xl font-serif italic text-stone-900">{givenCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Books Shared</div>
              </div>
            </div>
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-yellow-500">
                <Star size={24} className={rating > 0 ? "fill-yellow-500" : ""} />
              </div>
              <div>
                <div className="text-2xl font-serif italic text-stone-900">{rating > 0 ? rating.toFixed(1) : 'New'}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{ratingCount} Reviews</div>
              </div>
            </div>
          </div>

          {/* BookDrop History */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-900">
                <BookOpen size={12} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">BookDrop History</h3>
            </div>
            
            {books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map(book => (
                  <div key={book.id} className="flex gap-4 p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                    {auth.currentUser?.uid === userId && (
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        title="Delete Book"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="w-16 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center pr-6">
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{book.title}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{book.category}</p>
                      <div className={`mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded w-fit ${
                        book.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {book.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-stone-50 rounded-3xl border border-stone-100 border-dashed">
                <p className="text-sm text-stone-400 italic">No books shared yet.</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-900">
                  <Star size={12} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Recent Reviews</h3>
              </div>
              
              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 bg-stone-50 rounded-3xl border border-stone-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-400">
                          <User size={14} />
                        </div>
                        <span className="text-xs font-bold text-stone-900">{review.reviewerName || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-stone-300"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-stone-600 italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
