import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, MapPin, Heart, ArrowRight, ShieldCheck, Plus } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onListABook: () => void;
  onSupport: () => void;
}

export default function LandingHero({ onGetStarted, onLogin, onListABook, onSupport }: LandingHeroProps) {
  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-50 overflow-hidden flex flex-col">
      {/* Top Navigation for Landing */}
      <div className="relative z-20 px-4 sm:px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-stone-950 shadow-xl shadow-white/10">
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
          </div>
          <span className="font-serif italic text-xl sm:text-2xl tracking-tight">BookDrop</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-4 sm:px-6 py-2 rounded-full border border-stone-800 text-xs sm:text-sm font-medium hover:bg-stone-900 transition-all"
        >
          Sign In
        </button>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] sm:w-[60%] h-[60%] bg-stone-900 rounded-full blur-[80px] sm:blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] sm:w-[50%] h-[50%] bg-stone-800 rounded-full blur-[60px] sm:blur-[100px] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-20 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 sm:space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-900 border border-stone-800 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <ShieldCheck size={12} className="text-stone-500 sm:w-3.5 sm:h-3.5" />
            Strictly Free Community Exchange
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif italic leading-[0.85] tracking-tight">
            The life of a <br />
            <span className="text-stone-400">shared book.</span>
          </h1>

          <p className="max-w-xl mx-auto text-stone-400 text-base sm:text-lg md:text-xl font-light leading-relaxed px-4 sm:px-0">
            BookDrop is a neighborhood-first platform for giving and receiving books. 
            No money, no selling—just the joy of reading and community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-8">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 sm:py-5 bg-stone-50 text-stone-950 rounded-full font-medium text-base sm:text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Map
                <ArrowRight size={18} className="sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button 
              onClick={onListABook}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-stone-900 text-stone-50 rounded-full font-medium text-base sm:text-lg border border-stone-800 hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              List a Book
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-32 w-full"
        >
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-3xl bg-stone-900/50 border border-stone-800 backdrop-blur-sm space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-800 flex items-center justify-center text-stone-50">
              <MapPin size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Find Nearby</h3>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
              Discover books available in your immediate neighborhood. Our map-centric design makes local pickup easy.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-3xl bg-stone-900/50 border border-stone-800 backdrop-blur-sm space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-800 flex items-center justify-center text-stone-50">
              <BookOpen size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Give Back</h3>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
              Finished a great read? Pass it on. List your books in seconds and find them a new home where they'll be loved.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-3xl bg-stone-900/50 border border-stone-800 backdrop-blur-sm space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-800 flex items-center justify-center text-stone-50">
              <Heart size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Build Trust</h3>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
              Our community is built on trust. Rate your exchanges and help us maintain a safe, friendly environment.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Micro-details */}
      <div className="p-6 sm:p-8 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-stone-600">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <span>© 2026 BookDrop</span>
          <span className="hidden sm:inline">•</span>
          <span>Strictly Non-Commercial</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button onClick={onSupport} className="text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1.5">
            <Heart size={12} className="fill-rose-500" />
            Support BookDrop
          </button>
          <a href="#" className="hover:text-stone-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-stone-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-stone-400 transition-colors">Safety Guidelines</a>
        </div>
      </div>
    </div>
  );
}
