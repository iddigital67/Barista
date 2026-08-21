import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, KeyRound, X, AlertCircle, Sparkles } from 'lucide-react';

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      // Auto submit if length matches correctPin length
      if (newPin.length === correctPin.length) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (pinToVerify: string) => {
    if (pinToVerify === correctPin) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('PIN Salah! Silakan coba lagi.');
      setPin('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3 shadow-lg shadow-amber-950">
          <Lock className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-bold text-stone-100 text-center">
          Akses Owner / Manajemen
        </h3>
        <p className="text-xs text-stone-400 text-center mt-1 mb-5">
          Masukkan PIN Keamanan untuk membuka HPP rahasia, margin keuntungan, dan database.
        </p>

        {/* PIN Dots display */}
        <form onSubmit={handleFormSubmit} className="w-full flex flex-col items-center">
          <input
            ref={inputRef}
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPin(val);
              if (val.length === correctPin.length) {
                verifyPin(val);
              }
            }}
            className="opacity-0 absolute -z-10"
            autoFocus
          />

          <div className="flex gap-3 mb-4 cursor-pointer" onClick={() => inputRef.current?.focus()}>
            {Array.from({ length: correctPin.length || 4 }).map((_, idx) => {
              const isFilled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl border flex items-center justify-center text-xl font-bold transition-all ${
                    error
                      ? 'border-rose-500 bg-rose-950/30 text-rose-300 animate-pulse'
                      : isFilled
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-950/50 scale-105'
                      : 'border-stone-800 bg-stone-950/60 text-stone-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Numeric Keypad for Touch / Mobile */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] my-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
              const isAction = key === 'C' || key === '⌫';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') setPin('');
                    else if (key === '⌫') handleDelete();
                    else handleKeypadPress(key);
                  }}
                  className={`h-12 rounded-xl font-bold text-base flex items-center justify-center transition-all active:scale-90 ${
                    isAction
                      ? 'bg-stone-800/60 hover:bg-stone-800 text-stone-400 border border-stone-800'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700/60 shadow-sm'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800/80 w-full text-center">
            <p className="text-[11px] text-stone-500">
              Default PIN Owner: <strong className="text-amber-400/80">1234</strong> (Dapat diubah di Setting Kafe)
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
