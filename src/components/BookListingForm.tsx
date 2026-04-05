import React, { useState, useRef, useEffect } from 'react';
import { db, collection, addDoc, updateDoc, doc, serverTimestamp, auth } from '../firebase';
import { BookCondition, BookListing } from '../types';
import { X, Upload, MapPin, BookOpen, ShieldAlert, Plus, Sparkles, ThumbsUp, History, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as geofire from 'geofire-common';

interface BookListingFormProps {
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  existingBook?: BookListing;
}

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Textbook', 'Children', 'Mystery', 'Sci-Fi', 'Biography', 'Other'];
const CONDITIONS: { value: BookCondition; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'New', 
    label: 'New', 
    desc: 'Perfect condition', 
    icon: <Sparkles size={24} />,
    color: 'amber'
  },
  { 
    value: 'Good', 
    label: 'Good', 
    desc: 'Lightly used', 
    icon: <ThumbsUp size={24} />,
    color: 'emerald'
  },
  { 
    value: 'Used', 
    label: 'Used', 
    desc: 'Well-loved', 
    icon: <History size={24} />,
    color: 'stone'
  }
];

export default function BookListingForm({ onClose, userLocation, existingBook }: BookListingFormProps) {
  const [title, setTitle] = useState(existingBook?.title || '');
  const [description, setDescription] = useState(existingBook?.description || '');
  const [category, setCategory] = useState(existingBook?.category || CATEGORIES[0]);
  const [condition, setCondition] = useState<BookCondition>(existingBook?.condition || 'Good');
  const [imageUrl, setImageUrl] = useState(existingBook?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageValid, setIsImageValid] = useState(!!existingBook?.imageUrl);
  const [isbn, setIsbn] = useState('');
  const [isSearchingIsbn, setIsSearchingIsbn] = useState(false);
  const [isbnError, setIsbnError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIsbnSearch = async () => {
    if (!isbn.trim()) return;
    setIsSearchingIsbn(true);
    setIsbnError(null);
    
    // Clean ISBN: remove hyphens and spaces
    const cleanIsbn = isbn.replace(/[- ]/g, '').trim();
    
    try {
      // 1. Try Google Books API (Exact ISBN)
      let response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
      let data = await response.json();
      
      // 2. Try Google Books API (General Search)
      if (!data.items || data.items.length === 0) {
        response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}`);
        data = await response.json();
      }
      
      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo;
        
        if (bookInfo.title) setTitle(bookInfo.title);
        if (bookInfo.description) setDescription(bookInfo.description);
        
        // Try to match category
        if (bookInfo.categories && bookInfo.categories.length > 0) {
          const apiCategory = bookInfo.categories[0];
          const matchedCategory = CATEGORIES.find(c => apiCategory.toLowerCase().includes(c.toLowerCase()));
          if (matchedCategory) setCategory(matchedCategory);
        }

        // Get high quality image if available
        let imgUrl = '';
        if (bookInfo.imageLinks) {
          imgUrl = bookInfo.imageLinks.thumbnail || bookInfo.imageLinks.smallThumbnail;
          // Upgrade to https and remove edge curl if present
          imgUrl = imgUrl.replace('http:', 'https:').replace('&edge=curl', '');
        }
        
        if (imgUrl) {
          setImageUrl(imgUrl);
          setUploadMethod('url');
          setIsImageValid(true);
        }
        return; // Success!
      }
      
      // 3. Fallback to OpenLibrary API if Google Books fails
      const olResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const olData = await olResponse.json();
      const bookKey = `ISBN:${cleanIsbn}`;
      
      if (olData[bookKey]) {
        const bookInfo = olData[bookKey];
        
        if (bookInfo.title) setTitle(bookInfo.title);
        
        // OpenLibrary descriptions can be objects or strings
        if (bookInfo.description) {
           setDescription(typeof bookInfo.description === 'string' ? bookInfo.description : bookInfo.description.value || '');
        } else if (bookInfo.excerpts && bookInfo.excerpts.length > 0) {
           setDescription(bookInfo.excerpts[0].text || '');
        }
        
        // Match category
        if (bookInfo.subjects && bookInfo.subjects.length > 0) {
          const apiCategory = bookInfo.subjects[0].name;
          const matchedCategory = CATEGORIES.find(c => apiCategory.toLowerCase().includes(c.toLowerCase()));
          if (matchedCategory) setCategory(matchedCategory);
        }
        
        // Get image
        if (bookInfo.cover && bookInfo.cover.large) {
          setImageUrl(bookInfo.cover.large);
          setUploadMethod('url');
          setIsImageValid(true);
        }
        return; // Success!
      }

      setIsbnError('Book not found. Please enter details manually.');
    } catch (error) {
      console.error("Error fetching ISBN:", error);
      setIsbnError('Failed to fetch book details. Please try manually.');
    } finally {
      setIsSearchingIsbn(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrl(compressedDataUrl);
          setIsImageValid(true);
          
          // Reset input value to allow selecting the same file again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    if (uploadMethod === 'file') {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userLocation) return;

    if (!imageUrl) {
      setImageError('Please provide a book cover image.');
      return;
    }

    if (uploadMethod === 'url' && !isImageValid) {
      setImageError('Please provide a valid image URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const hash = geofire.geohashForLocation([userLocation.lat, userLocation.lng]);
      
      const bookData = {
        title,
        description,
        category,
        condition,
        imageUrl,
        location: userLocation,
        geohash: hash,
      };

      if (existingBook) {
        await updateDoc(doc(db, 'books', existingBook.id), bookData);
      } else {
        await addDoc(collection(db, 'books'), {
          ...bookData,
          ownerId: auth.currentUser.uid,
          ownerName: auth.currentUser.displayName,
          status: 'Available',
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionStyles = (cond: typeof CONDITIONS[0], isSelected: boolean) => {
    const colors: Record<string, { active: string; inactive: string; icon: string }> = {
      amber: {
        active: 'bg-amber-500 border-amber-500 shadow-amber-500/20',
        inactive: 'bg-white border-stone-100 hover:border-amber-200',
        icon: isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-500'
      },
      emerald: {
        active: 'bg-emerald-500 border-emerald-500 shadow-emerald-500/20',
        inactive: 'bg-white border-stone-100 hover:border-emerald-200',
        icon: isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'
      },
      stone: {
        active: 'bg-stone-800 border-stone-800 shadow-stone-800/20',
        inactive: 'bg-white border-stone-100 hover:border-stone-300',
        icon: isSelected ? 'bg-white/20 text-white' : 'bg-stone-50 text-stone-500'
      }
    };
    return colors[cond.color];
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-900/20">
              <BookOpen size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif italic text-stone-900">{existingBook ? 'Edit Book' : 'List a New Book'}</h2>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Neighborhood Exchange</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-stone-400 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 sm:space-y-10">
          {/* Smart Fill Section */}
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Smart Fill (Optional)</h3>
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Enter the book's ISBN (found on the back cover barcode) to automatically fill in the title, description, and cover image. You can still edit them manually.
            </p>
            <div className="flex gap-2">
              <input 
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9780141182803"
                className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-sm font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleIsbnSearch();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleIsbnSearch}
                disabled={isSearchingIsbn || !isbn.trim()}
                className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSearchingIsbn ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={14} />
                    Search
                  </>
                )}
              </button>
            </div>
            {isbnError && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert size={12} />
                {isbnError}
              </p>
            )}
          </div>

          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-900">01</div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Basic Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Book Title</label>
                <input 
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Great Gatsby"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-lg font-serif italic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                        category === cat 
                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20' 
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Condition & Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-900">02</div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Condition & Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CONDITIONS.map(cond => {
                  const isSelected = condition === cond.value;
                  const styles = getConditionStyles(cond, isSelected);
                  return (
                    <motion.button
                      key={cond.value}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCondition(cond.value)}
                      className={`relative p-5 rounded-[32px] border-2 text-left transition-all overflow-hidden ${
                        isSelected ? styles.active : styles.inactive
                      }`}
                    >
                      <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${styles.icon} ${isSelected ? 'scale-110' : ''}`}>
                          {cond.icon}
                        </div>
                        
                        <div className="space-y-1">
                          <div className={`text-sm font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                            {cond.label}
                          </div>
                          <div className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-white/70' : 'text-stone-500'}`}>
                            {cond.desc}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div 
                          layoutId="activeCondition"
                          className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/10 -z-0"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell others about the book's condition or why you're giving it away..."
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Visuals & Location */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-900">03</div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Visuals & Location</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-6">
                {/* Unified Preview Area */}
                <div className="relative group mx-auto sm:mx-0">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div 
                    onClick={triggerFileUpload}
                    className={`w-40 h-56 rounded-[32px] bg-stone-100 border-2 border-stone-200 overflow-hidden transition-all shadow-inner relative ${
                      uploadMethod === 'file' ? 'cursor-pointer hover:border-stone-900 border-dashed' : 'border-solid'
                    } ${imageUrl ? 'border-solid' : ''}`}
                  >
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imageUrl} 
                          alt="Book cover preview" 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-30' : 'opacity-100'}`}
                          referrerPolicy="no-referrer"
                          onLoad={() => {
                            setIsImageLoading(false);
                            setIsImageValid(true);
                            setImageError(null);
                          }}
                          onError={(e) => {
                            setIsImageLoading(false);
                            setIsImageValid(false);
                            setImageError('Invalid image URL or file.');
                            e.currentTarget.src = 'https://picsum.photos/seed/error/400/600';
                          }}
                        />
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-stone-900/20 border-t-stone-900 rounded-full animate-spin" />
                          </div>
                        )}
                        {uploadMethod === 'url' && !isImageLoading && (
                          <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-widest">
                            Live Preview
                          </div>
                        )}
                        {uploadMethod === 'file' && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur p-2 rounded-full text-stone-900 shadow-lg">
                              <Upload size={20} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                          <Upload size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {uploadMethod === 'file' ? 'Click to upload' : 'No Image'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {imageUrl && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImageUrl('');
                      }}
                      className="absolute -top-2 -right-2 p-2 bg-white rounded-full text-stone-400 hover:text-red-500 shadow-md border border-stone-100 z-10 transition-colors"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex p-1 bg-stone-100 rounded-2xl w-fit">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        uploadMethod === 'file' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        uploadMethod === 'url' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">
                      {uploadMethod === 'file' ? 'Choose from device' : 'Enter image link'}
                    </label>
                    
                    {uploadMethod === 'file' ? (
                      <button 
                        type="button"
                        onClick={triggerFileUpload}
                        className={`flex items-center gap-3 px-6 py-4 bg-stone-50 border rounded-2xl cursor-pointer transition-all group w-full text-left ${
                          imageError && uploadMethod === 'file' ? 'border-red-200 ring-4 ring-red-500/5' : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-400 group-hover:text-stone-900 shadow-sm transition-colors">
                          <Plus size={18} />
                        </div>
                        <span className="text-sm font-medium text-stone-600">
                          {imageUrl ? 'Change Image' : 'Select a photo'}
                        </span>
                      </button>
                    ) : (
                      <div className="relative">
                        <input 
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setIsImageValid(false);
                            setImageError(null);
                            if (e.target.value) setIsImageLoading(true);
                          }}
                          placeholder="https://example.com/book-cover.jpg"
                          className={`w-full px-6 py-4 bg-stone-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all pl-12 text-sm ${
                            imageError && uploadMethod === 'url' ? 'border-red-500 ring-red-500/5' : 'border-stone-200 focus:ring-stone-900/5 focus:border-stone-900'
                          }`}
                        />
                        <Upload className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${imageUrl ? 'text-stone-900' : 'text-stone-400'}`} size={18} />
                        {imageUrl && !isImageLoading && isImageValid && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {imageError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1 mt-1 flex items-center gap-1"
                      >
                        <ShieldAlert size={12} />
                        {imageError}
                      </motion.p>
                    )}
                    
                    <p className="text-[9px] text-stone-400 italic ml-1">
                      {imageUrl ? 'Preview updated above.' : 'An image is required to list your book.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-900 shadow-sm border border-stone-100">
                  <MapPin size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-900">Listing Location</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mt-0.5">
                    {userLocation ? 'Current location detected' : 'Detecting location...'}
                  </p>
                </div>
                {userLocation && (
                  <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-100">
                    Active
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4 p-6 bg-red-50/50 rounded-3xl text-red-600 border border-red-100/50">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">Strict No-Commerce Policy</p>
                <p className="text-[10px] text-red-500/80 leading-relaxed">
                  Selling is strictly prohibited. This listing is for FREE exchange only. 
                  Violation of this policy will result in a permanent ban.
                </p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !userLocation}
              className="w-full bg-stone-900 text-white py-6 rounded-3xl font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-stone-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{existingBook ? 'Saving...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>{existingBook ? 'Save Changes' : 'Publish Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
