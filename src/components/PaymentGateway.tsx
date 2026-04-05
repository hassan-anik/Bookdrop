import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Smartphone, Lock, CheckCircle2, ArrowRight, Loader2, Building2, Copy } from 'lucide-react';

interface PaymentGatewayProps {
  method: 'bkash' | 'nagad' | 'ebl';
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
  const [copied, setCopied] = useState<string | null>(null);

  const brandColor = method === 'bkash' ? '#D12053' : method === 'nagad' ? '#F7941D' : '#0055A5';
  const brandName = method === 'bkash' ? 'bKash' : method === 'nagad' ? 'Nagad' : 'Eastern Bank Limited';

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (method === 'ebl') {
    return (
      <div 
        className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-6 text-white flex items-center justify-between"
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-xs" style={{ color: brandColor }}>
                EBL
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Bank Transfer</h3>
                <p className="text-white/80 text-xs">International & Local</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                <Building2 size={32} />
              </div>
              <h4 className="text-xl font-serif italic text-stone-900">Account Details</h4>
              <p className="text-sm text-stone-500">Use these details to make a wire transfer or local bank deposit.</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Bank Name', value: 'Eastern Bank PLC' },
                { label: 'Account Name', value: 'MD. MAHMUDUL HASAN' },
                { label: 'Account Number', value: '1331260104168' },
                { label: 'Branch Name', value: 'Gulshan Avenue Branch' },
                { label: 'Routing Number', value: '095261733' },
                { label: 'SWIFT Code', value: 'EBLDBDDH' },
              ].map((detail) => (
                <div key={detail.label} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{detail.label}</p>
                    <p className="text-sm font-medium text-stone-900">{detail.value}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(detail.value, detail.label)}
                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors relative"
                    title={`Copy ${detail.label}`}
                  >
                    {copied === detail.label ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-[360px] rounded-[32px] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
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
