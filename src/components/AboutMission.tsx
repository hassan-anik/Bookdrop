import React from 'react';
import { BookOpen, MapPin, Users, Leaf, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutMissionProps {
  onGoToMap: () => void;
  key?: string;
}

export default function AboutMission({ onGoToMap }: AboutMissionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 z-20 bg-stone-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        {/* SEO Optimized Header */}
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-stone-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600 mb-8"
          >
            Our Mission
          </motion.div>
          <h1 className="text-5xl sm:text-7xl font-serif italic text-stone-900 mb-8 leading-[0.95] tracking-tight">
            Restoring the <br />
            <span className="text-stone-400">Neighborhood</span> Library.
          </h1>
          <p className="text-xl sm:text-2xl text-stone-500 max-w-2xl mx-auto leading-relaxed font-medium">
            BookDrop is a digital bridge for physical stories. Connect with your community through the simple act of sharing a book.
          </p>
        </header>

        {/* Main SEO Content Sections */}
        <div className="space-y-24">
          
          <section className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-stone-100 rounded-full -z-10 blur-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-stone-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl">
                  <MapPin size={28} />
                </div>
                <h2 className="text-3xl font-serif italic text-stone-900">How Local Sharing Works</h2>
                <p className="text-stone-600 leading-relaxed text-lg">
                  Every book on our map represents a story waiting to be rediscovered. Instead of buying new, you can drop a digital pin to list books you want to give away, lend, or trade. 
                </p>
                <p className="text-stone-500 leading-relaxed">
                  Neighbors discover your collection, message you securely, and arrange a safe swap. It's a sustainable, free, and beautiful way to read.
                </p>
              </div>
              <div className="bg-stone-100 aspect-square rounded-[60px] overflow-hidden relative border border-stone-200 p-8 flex items-center justify-center">
                <div className="text-stone-300">
                  <BookOpen size={120} strokeWidth={1} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-200/50 to-transparent"></div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-serif italic text-stone-900 mb-4">Strictly Free</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                No subscription fees, no marketplace tax. Just readers sharing with readers.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                <Leaf size={24} />
              </div>
              <h3 className="text-xl font-serif italic text-stone-900 mb-4">Sustainable</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Recycle stories and reduce waste. Every trade extends the life of a physical book.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-serif italic text-stone-900 mb-4">Community</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Meet your neighbors and build trust through the universal language of literature.
              </p>
            </div>
          </section>

          <section className="bg-stone-950 text-white p-12 sm:p-20 rounded-[60px] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-serif italic mb-8">Join the Neighborhood.</h2>
              <p className="text-stone-400 max-w-xl mx-auto mb-10 text-lg">
                Whether you're clearing shelf space or hunting for your next favorite author, BookDrop is where physical books find new homes.
              </p>
              <button 
                onClick={onGoToMap}
                className="inline-flex items-center gap-3 bg-white text-stone-950 px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Open the Map <ArrowRight size={20} />
              </button>
            </div>
          </section>

          {/* FAQ Section for SEO */}
          <section className="space-y-12 pb-24 pt-12">
            <div className="text-center space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Common Questions</div>
              <h2 className="text-4xl font-serif italic text-stone-900">Everything you need to know.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  Is BookDrop really free?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">Yes! BookDrop is a community-driven passion project. There are no fees to list, borrow, or swap books. We believe stories should be accessible to everyone.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  How do I exchange books safely?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">We recommend meeting in public, well-lit spaces like local cafes or parks. Always use the built-in chat to coordinate your meeting.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  Where can I find free books near me?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">Using our interactive map, you can discover a massive selection of second hand books being given away or lent by people in your own neighborhood. It's like finding a Little Free Library, but right on your phone.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  Can I trade used books locally?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">Absolutely. Most of our community members love to do direct book swaps. Check what your neighbors are looking for, send them a message, and trade physical books without paying for shipping.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  What kinds of books can I list?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">Anything! From first-edition novels to your favorite cookbooks. As long as it's a physical book in readable condition, it's welcome here.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-stone-200"></span>
                  How do I get started?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-9">Simply sign in, drop a pin at your location, and list the books you're ready to share. Or browse the map to see what's nearby!</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
