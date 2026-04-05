import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { BookListing, UserProfile } from '../types';
import { MapPin, Book as BookIcon, X, MessageCircle, Info, ShieldAlert, Star, BookOpen, User, Filter, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, addDoc, serverTimestamp, getDocs, handleFirestoreError, OperationType, doc, getDoc, deleteDoc } from '../firebase';
import { renderToStaticMarkup } from 'react-dom/server';

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Textbook', 'Children', 'Mystery', 'Sci-Fi', 'Biography', 'Other'];

interface BookMapProps {
  userLocation: { lat: number; lng: number } | null;
  onChatRequest: (chatId: string) => void;
  onLogin: () => void;
  onUserClick?: (userId: string) => void;
}

// Custom Marker Icon using Lucide
const customIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative -translate-x-1/2 -translate-y-full">
      <div className="bg-stone-900 text-white p-2 rounded-full shadow-lg border-2 border-white">
        <BookIcon size={16} />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-stone-900"></div>
    </div>
  ),
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const userLocationIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative -translate-x-1/2 -translate-y-1/2">
      <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
      <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-20"></div>
    </div>
  ),
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map center updates and expose a way to recenter
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function BookMap({ userLocation, onChatRequest, onLogin, onUserClick }: BookMapProps) {
  const [allBooks, setAllBooks] = useState<BookListing[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState<BookListing | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const defaultCenter: [number, number] = [23.8103, 90.4125];

  const handleRecenter = () => {
    if (mapInstance && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 13);
    }
  };

  useEffect(() => {
    if (selectedBook) {
      const fetchOwner = async () => {
        const docRef = doc(db, 'users', selectedBook.ownerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOwnerProfile(docSnap.data() as UserProfile);
        }
      };
      fetchOwner();
    } else {
      setOwnerProfile(null);
    }
  }, [selectedBook]);

  useEffect(() => {
    const q = query(
      collection(db, 'books'),
      where('status', '==', 'Available')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookListing[];
      setAllBooks(bookData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'books');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...allBooks];

    // Filter by Category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by Distance
    if (userLocation) {
      filtered = filtered.filter(book => {
        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          book.location.lat, book.location.lng
        );
        return dist <= 10;
      });
    }

    setFilteredBooks(filtered);
  }, [allBooks, selectedCategory, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const handleRequestBook = async () => {
    if (!selectedBook) return;
    if (!auth.currentUser) {
      onLogin();
      return;
    }
    
    setIsRequesting(true);
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('bookId', '==', selectedBook.id),
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let chatId;
      if (!querySnapshot.empty) {
        chatId = querySnapshot.docs[0].id;
      } else {
        const chatDoc = await addDoc(chatsRef, {
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          participants: [auth.currentUser.uid, selectedBook.ownerId],
          lastMessage: "Hi, I'd like to pick up this book.",
          updatedAt: serverTimestamp()
        });
        chatId = chatDoc.id;

        await addDoc(collection(db, `chats/${chatId}/messages`), {
          chatId,
          senderId: auth.currentUser.uid,
          text: "Hi, I'd like to pick up this book.",
          createdAt: serverTimestamp()
        });
      }
      onChatRequest(chatId);
    } catch (error) {
      console.error("Error requesting book:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleMarkerClick = (book: BookListing) => {
    if (!auth.currentUser) {
      onLogin();
    } else {
      setSelectedBook(book);
    }
  };

  const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="h-full w-full relative bg-stone-100">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={13} />
        
        {userLocation && (
          <>
            <Circle 
              center={[userLocation.lat, userLocation.lng]}
              radius={10000} // 10km in meters
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#3b82f6',
                weight: 1,
                dashArray: '5, 10'
              }}
            />
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={userLocationIcon}
            />
          </>
        )}
        
        {filteredBooks.map(book => (
          <Marker 
            key={book.id} 
            position={[book.location.lat, book.location.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(book),
            }}
          />
        ))}
      </MapContainer>

      <AnimatePresence>
        {filteredBooks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] text-center space-y-6 pointer-events-none"
          >
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl border border-stone-200 flex items-center justify-center mx-auto text-stone-300">
              <BookIcon size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic text-stone-900">Quiet neighborhood.</h3>
              <p className="text-stone-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                {selectedCategory === 'All' 
                  ? "No books have been dropped nearby yet. Be the first to share a story!"
                  : `No ${selectedCategory} books found nearby. Try another category?`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter Bar */}
      <div className="absolute top-16 left-0 right-0 z-[1000] px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-stone-200 pointer-events-auto shrink-0">
            <Filter size={18} className="text-stone-900" />
          </div>
          
          <div className="flex-1 overflow-x-auto no-scrollbar pointer-events-auto">
            <div className="flex gap-2 py-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20'
                    : 'bg-white/90 backdrop-blur-md text-stone-500 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {!userLocation ? (
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-stone-200 text-xs font-medium text-stone-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Detecting your location...
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-stone-200 text-[10px] font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Searching within 10km
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 shadow-sm text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
          <Info size={12} />
          OpenStreetMap - Free & Open
        </div>
        
        {userLocation && (
          <button 
            onClick={handleRecenter}
            className="bg-white p-3 rounded-2xl shadow-lg border border-stone-200 text-stone-900 hover:bg-stone-50 transition-all pointer-events-auto"
            title="Recenter Map"
          >
            <MapPin size={20} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedBook && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-4 right-4 md:left-8 md:bottom-24 md:w-96 bg-white rounded-[32px] shadow-2xl border border-stone-200 overflow-hidden z-[2000]"
          >
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-stone-900 shadow-md z-10 hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="h-40 sm:h-48 bg-stone-200 relative">
              {selectedBook.imageUrl ? (
                <img 
                  src={selectedBook.imageUrl} 
                  className="w-full h-full object-cover" 
                  alt={selectedBook.title}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <BookIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-stone-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                FREE
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif italic text-stone-900">{selectedBook.title}</h3>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded">
                    {selectedBook.condition}
                  </span>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2">{selectedBook.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {userLocation ? `${calculateDistance(userLocation.lat, userLocation.lng, selectedBook.location.lat, selectedBook.location.lng).toFixed(1)} km away` : 'Nearby'}
                </div>
                <div className="flex items-center gap-1">
                  <Info size={14} />
                  {selectedBook.category}
                </div>
              </div>

              <div className="py-4 border-y border-stone-100">
                <div 
                  className={`flex items-center gap-3 ${onUserClick ? 'cursor-pointer hover:bg-stone-50 p-2 -mx-2 rounded-2xl transition-colors' : ''}`}
                  onClick={() => onUserClick && selectedBook.ownerId && onUserClick(selectedBook.ownerId)}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200">
                    {ownerProfile?.photoURL ? (
                      <img src={ownerProfile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={20} className="text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900 group-hover:text-stone-700">{ownerProfile?.displayName || 'Loading...'}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        {ownerProfile?.rating ? ownerProfile.rating.toFixed(1) : 'New'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                        <BookOpen size={10} className="text-stone-400" />
                        {ownerProfile?.givenCount || 0} Given
                      </div>
                    </div>
                  </div>
                  {onUserClick && (
                    <ChevronRight size={16} className="text-stone-300" />
                  )}
                </div>
              </div>

              <div className="pt-2">
                {selectedBook.ownerId === auth.currentUser?.uid ? (
                  <div className="flex gap-2">
                    <div className="flex-1 text-center py-3 bg-stone-100 rounded-2xl text-stone-500 text-sm font-medium italic">
                      This is your listing
                    </div>
                    <button 
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this book?")) {
                          try {
                            await deleteDoc(doc(db, 'books', selectedBook.id));
                            setSelectedBook(null);
                          } catch (error) {
                            console.error("Error deleting book:", error);
                            alert("Failed to delete book.");
                          }
                        }
                      }}
                      className="px-4 bg-red-50 text-red-500 rounded-2xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                      title="Delete Listing"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleRequestBook}
                    disabled={isRequesting}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageCircle size={20} />
                    {isRequesting ? 'Requesting...' : 'Request Book'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 justify-center text-[9px] text-stone-400 uppercase tracking-widest font-bold">
                <ShieldAlert size={12} />
                Public meeting suggested
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
