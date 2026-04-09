import React from 'react';
import { BookOpen, MapPin, Users, Leaf, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutMissionProps {
  onGoToMap: () => void;
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
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif italic text-stone-900 mb-6">
            About BookDrop: Your Local Book Sharing Community
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            BookDrop is a free, interactive neighborhood library map that connects you with readers in your local community. Discover, borrow, and trade books right in your own backyard.
          </p>
        </header>

        {/* Main SEO Content Sections */}
        <div className="space-y-16">
          
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">How Local Book Exchange Works</h2>
            </div>
            <p className="text-stone-600 leading-relaxed text-lg">
              Instead of buying new books or letting your finished reads collect dust, BookDrop lets you drop a digital pin on our community map. You can list books you want to give away, lend, or trade. Neighbors can easily discover your books, message you securely through the app, and arrange a safe local book swap. It's like having thousands of Little Free Libraries right on your phone.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <BookOpen size={32} className="text-amber-500 mb-6" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Free Book Sharing</h3>
              <p className="text-stone-600 leading-relaxed">
                Never pay for a good read again. Our platform is strictly non-commercial, ensuring a 100% free book exchange experience for everyone.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <Leaf size={32} className="text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Eco-Friendly & Sustainable</h3>
              <p className="text-stone-600 leading-relaxed">
                Reduce paper waste and carbon footprints by recycling stories within your neighborhood. Sustainable reading starts locally.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <Users size={32} className="text-blue-500 mb-6" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Meet Local Readers</h3>
              <p className="text-stone-600 leading-relaxed">
                Build a stronger community by connecting over shared interests. Discover what your neighbors are reading and make new friends.
              </p>
            </div>
          </section>

          <section className="bg-stone-900 text-white p-8 sm:p-12 rounded-3xl text-center">
            <h2 className="text-3xl font-serif italic mb-6">Start Borrowing and Trading Today</h2>
            <p className="text-stone-300 max-w-2xl mx-auto mb-8 text-lg">
              Whether you're looking for fiction, textbooks, or children's books, BookDrop is your ultimate local book exchange platform. Join thousands of readers building the world's largest decentralized library.
            </p>
            <button 
              onClick={onGoToMap}
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-stone-100 transition-colors"
            >
              Explore the Map <ArrowRight size={20} />
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
