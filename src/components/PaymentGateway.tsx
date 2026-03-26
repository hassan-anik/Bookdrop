import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Smartphone, Lock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentGatewayProps {
  method: 'bkash' | 'nagad';
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'amount' | 'number' | 'otp' | 'pin' | 'processing' | 'success';

export default function PaymentGateway({ method, onClose, onSuccess }: PaymentGatewayProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('100');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');

  const brandColor = method === 'bkash' ? '#D12053' : '#F7941D';
  const brandName = method === 'bkash' ? 'bKash' : 'Nagad';

  const handleNext = () => {
    if (step === 'amount') setStep('number');
    else if (step === 'number') setStep('otp');
    else if (step === 'otp') setStep('pin');
    else if (step === 'pin') {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-[360px] rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div 
          className="p-6 text-white flex items-center justify-between"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xl" style={{ color: brandColor }}>
              {brandName[0]}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">{brandName} Checkout</h3>
              <p className="text-[10px] opacity-80 font-medium uppercase tracking-widest mt-1">Secure Payment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Support Amount</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-serif italic text-stone-400">৳</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-5xl font-serif italic text-stone-900 w-32 text-center focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['50', '100', '500'].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${amount === val ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
                    >
                      ৳{val}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  Next <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {step === 'number' && (
              <motion.div
                key="number"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Smartphone size={12} />
                    Your {brandName} Number
                  </label>
                  <input 
                    type="tel" 
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-stone-900/5 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed text-center italic">
                  By clicking next, you agree to the terms and conditions of {brandName} payment gateway.
                </p>
                <button 
                  disabled={phoneNumber.length < 11}
                  onClick={handleNext}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  Send OTP
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Enter 6-Digit OTP</p>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-3xl font-bold tracking-[0.5em] text-center focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-400">Sent to {phoneNumber}</p>
                </div>
                <button 
                  disabled={otp.length < 6}
                  onClick={handleNext}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  Verify OTP
                </button>
              </motion.div>
            )}

            {step === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center justify-center gap-2">
                    <Lock size={12} />
                    Enter {brandName} PIN
                  </label>
                  <input 
                    type="password" 
                    maxLength={5}
                    placeholder="•••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-3xl font-bold tracking-[0.5em] text-center focus:outline-none"
                  />
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-stone-500">Total Amount:</span>
                  <span className="font-bold text-stone-900">৳{amount}</span>
                </div>
                <button 
                  disabled={pin.length < 5}
                  onClick={handleNext}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  Confirm Payment
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center space-y-6"
              >
                <Loader2 size={48} className="text-stone-900 animate-spin" style={{ color: brandColor }} />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-stone-900">Processing Payment</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Please do not close this window</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 size={48} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xl font-serif italic text-stone-900">Thank you!</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Payment Successful</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-center gap-2 text-stone-400">
          <ShieldCheck size={14} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Verified by {brandName} Secure</span>
        </div>
      </motion.div>
    </div>
  );
}
