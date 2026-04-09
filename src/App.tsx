/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onSnapshot, doc, setDoc, getDoc } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfile } from './types';
import Navbar from './components/Navbar';
import BookMap from './components/BookMap';
import BookListingForm from './components/BookListingForm';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import UserProfileModal from './components/UserProfileModal';
import ReviewModal from './components/ReviewModal';
import NotificationSettingsModal from './components/NotificationSettingsModal';
import SafetyModal from './components/SafetyModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PromotedAppsModal from './components/PromotedAppsModal';
import AboutMission from './components/AboutMission';
import { useNotifications } from './hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';
import PaymentGateway from './components/PaymentGateway';
import { Book, MessageCircle, Plus, Map as MapIcon, ShieldAlert, Info, X, Heart, BookOpen, MapPin, Star, ChevronRight } from 'lucide-react';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'chats' | 'about'>('map');
  const [showListingForm, setShowListingForm] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMoreApps, setShowMoreApps] = useState(false);
  const [showSponsorBanner, setShowSponsorBanner] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'ebl' | null>(null);
  const [pendingListing, setPendingListing] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ userId: string; userName: string; bookId: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);

  useNotifications(userProfile);

  useEffect(() => {
    // If user is logged in, skip landing
    if (user) {
      if (pendingListing) {
        setShowListingForm(true);
        setPendingListing(false);
      }
    }
  }, [user, pendingListing]);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            photoURL: user.photoURL || undefined,
            givenCount: 0,
            receivedCount: 0,
            rating: 0,
            ratingCount: 0,
          };
          await setDoc(docRef, newProfile);
          setUserProfile(newProfile);
        }
      });
      
      return () => unsubscribe();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location if needed
          setUserLocation({ lat: 23.8103, lng: 90.4125 }); // Dhaka as default
        }
      );
    }
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show a scary error
        console.log("Login popup closed by user");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log("Login request cancelled");
      } else {
        console.error("Login error:", error);
        setLoginError(`Failed to sign in (${error.code || error.message}). If you're using a browser that blocks popups, please allow them for this site and try again.`);
      }
    }
  };
  const handleLogout = () => {
    signOut(auth);
  };

  const handleListABook = async () => {
    if (!user) {
      setPendingListing(true);
      await handleLogin();
    } else {
      setShowListingForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="text-stone-400 animate-pulse font-serif italic text-xl">Loading BookDrop...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      {loginError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md w-full">
          <div className="flex-1 text-sm">{loginError}</div>
          <button onClick={() => setLoginError(null)} className="text-white hover:text-red-200">
            &times;
          </button>
        </div>
      )}
      <Navbar 
        user={user || null} 
        userProfile={userProfile}
        onLogout={handleLogout} 
        onLogin={handleLogin} 
        onAddBook={() => setShowListingForm(true)}
        onSupport={() => setShowSupportModal(true)}
        onSettings={() => setShowNotificationSettings(true)}
        onSafety={() => setShowSafetyModal(true)}
        onPrivacy={() => setShowPrivacyModal(true)}
        onTerms={() => setShowTermsModal(true)}
        onMoreApps={() => setShowMoreApps(true)}
        onMission={() => setActiveTab('about')}
        onHome={() => setActiveTab('map')}
        onProfileClick={() => user && setSelectedUserId(user.uid)}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <div className={`absolute inset-0 ${activeTab === 'map' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'} transition-opacity duration-300`}>
            <BookMap 
              userLocation={userLocation} 
              onChatRequest={(chatId) => {
                setSelectedChatId(chatId);
                setActiveTab('chats');
              }}
              onLogin={handleLogin}
              onUserClick={(userId) => setSelectedUserId(userId)}
              onEditBook={(book) => {
                setEditingBook(book);
                setShowListingForm(true);
              }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <AboutMission key="about" onGoToMap={() => setActiveTab('map')} />
            )}
            {activeTab === 'chats' && user && (
              <motion.div 
                key="chats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 flex z-20 bg-white"
              >
                <div className={`${selectedChatId ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-stone-200 bg-white`}>
                  <ChatList 
                    onSelectChat={setSelectedChatId} 
                    selectedChatId={selectedChatId} 
                    onSupport={() => setShowSupportModal(true)}
                  />
                </div>
                <div className={`${selectedChatId ? 'block' : 'hidden md:block'} flex-1 bg-stone-50`}>
                  {selectedChatId ? (
                    <ChatWindow 
                      chatId={selectedChatId} 
                      onBack={() => setSelectedChatId(null)} 
                      onReviewUser={(userId, userName, bookId) => setReviewTarget({ userId, userName, bookId })}
                      onUserClick={(userId) => setSelectedUserId(userId)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-400 italic">
                      Select a conversation to start chatting
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        <div className="bg-white border-t border-stone-200 p-2 flex justify-around items-center md:hidden">
          <button 
            onClick={() => setActiveTab('map')}
            className={`p-3 rounded-2xl transition-colors ${activeTab === 'map' ? 'bg-stone-900 text-white' : 'text-stone-400'}`}
          >
            <MapIcon size={24} />
          </button>
          <button 
            onClick={handleListABook}
            className="p-3 bg-stone-900 text-white rounded-full shadow-lg -mt-8 border-4 border-stone-50"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={() => {
              if (!user) {
                handleLogin();
              } else {
                setActiveTab('chats');
              }
            }}
            className={`p-3 rounded-2xl transition-colors ${activeTab === 'chats' ? 'bg-stone-900 text-white' : 'text-stone-400'}`}
          >
            <MessageCircle size={24} />
          </button>
        </div>

        {/* Desktop Floating Action Button */}
        <button 
          onClick={handleListABook}
          className="hidden md:flex fixed bottom-8 right-8 bg-stone-900 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform items-center gap-2 group z-[1500]"
        >
          <Plus size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium">List a Book</span>
        </button>

        {/* Desktop Tab Switcher */}
        <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-stone-200 p-1 rounded-full shadow-lg z-[1500]">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'map' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Map
          </button>
          <button 
            onClick={() => {
              if (!user) {
                handleLogin();
              } else {
                setActiveTab('chats');
              }
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'chats' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Messages
          </button>
        </div>
      </main>

      <AnimatePresence>
        {showListingForm && user && (
          <BookListingForm 
            onClose={() => {
              setShowListingForm(false);
              setEditingBook(null);
            }} 
            userLocation={userLocation}
            existingBook={editingBook}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUserId && (
          <UserProfileModal 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
            onEditBook={(book) => {
              setEditingBook(book);
              setShowListingForm(true);
              setSelectedUserId(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewTarget && (
          <ReviewModal 
            targetUserId={reviewTarget.userId}
            targetUserName={reviewTarget.userName}
            bookId={reviewTarget.bookId}
            onClose={() => setReviewTarget(null)} 
          />
        )}
      </AnimatePresence>

      {/* Payment Gateway Modal */}
      <AnimatePresence>
        {paymentMethod && (
          <PaymentGateway 
            method={paymentMethod}
            onClose={() => setPaymentMethod(null)}
            onSuccess={() => {
              // Handle successful payment (e.g., show a toast or update user profile)
              console.log('Payment successful!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setShowSupportModal(false)}
                className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 sm:p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto shadow-sm">
                  <Heart size={32} className="fill-rose-500" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif italic text-stone-900">Support BookDrop</h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    We're a small team keeping this community free and ad-free. Your support helps cover server costs and keeps the neighborhood sharing.
                  </p>
                </div>

                <div className="grid gap-3">
                  {/* bKash Checkout Option */}
                  <button 
                    onClick={() => {
                      setPaymentMethod('bkash');
                      setShowSupportModal(false);
                    }}
                    className="group relative bg-[#D12053] p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-pink-500/10 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[#D12053] text-xs">bKash</div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Local Support (BD)</p>
                        <p className="text-sm font-bold text-white">bKash Checkout</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/30 group-hover:text-white transition-colors" />
                  </button>

                  {/* Nagad Checkout Option */}
                  <button 
                    onClick={() => {
                      setPaymentMethod('nagad');
                      setShowSupportModal(false);
                    }}
                    className="group relative bg-[#F7941D] p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-orange-500/10 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[#F7941D] text-xs">Nagad</div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Local Support (BD)</p>
                        <p className="text-sm font-bold text-white">Nagad Checkout</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/30 group-hover:text-white transition-colors" />
                  </button>

                  {/* EBL Bank Transfer Option */}
                  <button 
                    onClick={() => {
                      setPaymentMethod('ebl');
                      setShowSupportModal(false);
                    }}
                    className="group relative bg-[#0055A5] p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[#0055A5] text-xs">EBL</div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">International / Bank</p>
                        <p className="text-sm font-bold text-white">EBL Bank Transfer</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/30 group-hover:text-white transition-colors" />
                  </button>

                  {/* Patreon Option */}
                  <a 
                    href="https://www.patreon.com/c/MahmudulHasan557" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#FF424D] text-white font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-red-500/10"
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#FF424D] rounded-full" />
                    </div>
                    Support on Patreon
                  </a>

                  <button 
                    onClick={() => setShowSupportModal(false)}
                    className="w-full py-4 bg-stone-50 text-stone-400 font-bold rounded-2xl hover:bg-stone-100 transition-colors text-xs uppercase tracking-widest"
                  >
                    Maybe later
                  </button>
                </div>

                <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">
                  Thank you for being part of us
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* How it Works Modal */}
      <AnimatePresence>
        {showHowItWorks && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-visible"
            >
              <div className="w-full md:w-1/2 bg-stone-900 p-8 sm:p-10 text-white flex flex-col justify-between">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-800 flex items-center justify-center">
                    <BookOpen size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif italic leading-tight">Sharing made <br />simple.</h2>
                  <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                    BookDrop is a community-driven platform where books find new lives. 
                    We believe in the power of shared stories and neighborhood trust.
                  </p>
                </div>
                <div className="pt-8 sm:pt-10 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <ShieldAlert size={12} className="sm:w-3.5 sm:h-3.5" />
                  Strictly Non-Commercial
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 sm:p-10 space-y-6 sm:space-y-8 relative">
                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-stone-300 hover:text-stone-900 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-serif italic shrink-0 text-sm sm:text-base">1</div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <h4 className="font-medium text-xs sm:text-sm">List your books</h4>
                      <p className="text-stone-500 text-[10px] sm:text-xs leading-relaxed">Snap a photo and set a location. Your book will appear on the neighborhood map.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-serif italic shrink-0 text-sm sm:text-base">2</div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <h4 className="font-medium text-xs sm:text-sm">Chat & Coordinate</h4>
                      <p className="text-stone-500 text-[10px] sm:text-xs leading-relaxed">Interested readers will message you. Coordinate a safe, public pickup location.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-serif italic shrink-0 text-sm sm:text-base">3</div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <h4 className="font-medium text-xs sm:text-sm">Exchange & Rate</h4>
                      <p className="text-stone-500 text-[10px] sm:text-xs leading-relaxed">Hand over the book and rate your experience. Build your reputation as a trusted sharer.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="w-full bg-stone-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-medium hover:bg-stone-800 transition-colors text-sm sm:text-base"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Button */}
      <button 
        onClick={() => setShowHowItWorks(true)}
        className="fixed bottom-8 left-8 p-4 bg-white border border-stone-200 rounded-full shadow-lg text-stone-400 hover:text-stone-900 transition-colors z-[1500]"
      >
        <Info size={24} />
      </button>

      {/* Sponsor Banner */}
      <AnimatePresence>
        {showSponsorBanner && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[1500] max-w-sm w-[calc(100%-4rem)] sm:w-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 flex items-start gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50 pointer-events-none" />
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0 relative z-10 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <div className="flex-1 relative z-10 pr-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Developer Pick</p>
                <h4 className="text-sm font-bold text-stone-900 leading-tight">100 Card Game Online PvP</h4>
                <p className="text-xs text-stone-600 mt-1 line-clamp-1">Fast Multiplayer Fun! Play now.</p>
                <a 
                  href="https://play.google.com/store/apps/details?id=app.emergent.pointchase03e0c36e&pcampaignid=web_share" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                >
                  Download Free
                </a>
              </div>
              <button 
                onClick={() => setShowSponsorBanner(false)}
                className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors z-20"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showNotificationSettings && (
        <NotificationSettingsModal
          userProfile={userProfile}
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {showSafetyModal && (
        <SafetyModal onClose={() => setShowSafetyModal(false)} />
      )}

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {showTermsModal && (
        <TermsOfServiceModal onClose={() => setShowTermsModal(false)} />
      )}

      <AnimatePresence>
        {showMoreApps && (
          <PromotedAppsModal onClose={() => setShowMoreApps(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
