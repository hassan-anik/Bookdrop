import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, getDoc } from '../firebase';
import { X, Bell, Mail, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface NotificationSettingsModalProps {
  userProfile: UserProfile | null;
  onClose: () => void;
}

export default function NotificationSettingsModal({ userProfile, onClose }: NotificationSettingsModalProps) {
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.notificationSettings) {
      setBrowserNotifications(userProfile.notificationSettings.browserNotifications);
      setEmailAlerts(userProfile.notificationSettings.emailAlerts);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;
    setSaving(true);

    let finalBrowserNotifications = browserNotifications;

    // Request browser permission if turning on
    if (browserNotifications && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        finalBrowserNotifications = false;
        setBrowserNotifications(false);
        alert("Browser notifications were denied. Please enable them in your browser settings.");
      }
    }

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        notificationSettings: {
          browserNotifications: finalBrowserNotifications,
          emailAlerts
        }
      });
      onClose();
    } catch (error) {
      console.error("Error saving notification settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif italic text-2xl text-stone-900">Notifications</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Browser Notifications */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-stone-900">Browser Notifications</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={browserNotifications}
                      onChange={(e) => setBrowserNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                  </label>
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  Get real-time alerts when you receive a new message or when a book you might like is listed nearby.
                </p>
              </div>
            </div>

            {/* Email Alerts */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-stone-900">Weekly Email Digest</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                  </label>
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  Receive a weekly summary of new "Books near you".
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Note on Emails:</strong> Since this is a client-side prototype, email digests are simulated. In a production environment, this preference would trigger a backend cron job to dispatch actual emails via SendGrid or similar.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-stone-100 bg-stone-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
