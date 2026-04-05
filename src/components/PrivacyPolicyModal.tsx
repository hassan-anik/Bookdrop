import React from 'react';
import { X, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-stone-900">Privacy Policy</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Last Updated: April 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when you create an account, list a book, or communicate with other users. This includes your name, email address, profile picture, and location data (if you choose to share it).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">2. How We Use Your Information</h3>
            <p>
              We use the information we collect to operate, maintain, and improve BookDrop. This includes displaying your book listings on the map, facilitating communication between users, and ensuring a safe environment for our community.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">3. Location Data</h3>
            <p>
              BookDrop relies on location data to show nearby books. We only collect your location when you actively use the app and grant permission. Your exact location is never shared with other users; we only show approximate distances.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">4. Data Sharing and Security</h3>
            <p>
              We do not sell your personal information to third parties. We implement reasonable security measures to protect your data, but please remember that no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">5. Your Rights</h3>
            <p>
              You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
