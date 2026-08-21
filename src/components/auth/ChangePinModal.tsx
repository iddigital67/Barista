import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  User, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles 
} from 'lucide-react';
import { UserRole } from '../../types';
import confetti from 'canvas-confetti';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  userName: string;
  currentPin: string;
  onSaveNewPin: (newPin: string, role: UserRole, targetUserName?: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName,
  currentPin,
  onSaveNewPin,
}) => {
  const isOwner = userRole === 'owner';

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSuccessMessage('');
      setShowPins(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Verify old PIN
    if (oldPin.trim() !== currentPin.trim()) {
      setError('PIN saat ini / lama tidak cocok!');
      return;
    }

    // 2. Validate new PIN length (4-6 digits)
    const cleanNewPin = newPin.trim();
    if (cleanNewPin.length < 4 || cleanNewPin.length > 6) {
      setError('PIN baru harus terdiri dari 4 sampai 6 digit angka!');
      return;
    }

    if (!/^\d+$/.test(cleanNewPin)) {
      setError('PIN hanya boleh berupa angka!');
      return;
    }

    // 3. Check confirmation
    if (cleanNewPin !== confirmPin.trim()) {
      setError('Konfirmasi PIN baru tidak sesuai!');
      return;
    }

    // 4. Save
    onSaveNewPin(cleanNewPin, userRole, isOwner ? undefined : userName);
    setSuccessMessage('PIN Anda berhasil diubah!');

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-4">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isOwner 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-950'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-950'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Ganti PIN Pengguna</span>
              </h3>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <span>Akun:</span>
                <strong className={`font-semibold ${isOwner ? 'text-amber-300' : 'text-blue-300'}`}>
                  {isOwner ? '👑 Owner / Management' : `☕ ${userName}`}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs text-stone-200">
          
          {successMessage ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-2 text-center py-6 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-bold text-sm text-white">{successMessage}</h4>
              <p className="text-[11px] text-emerald-400/80">
                Gunakan PIN baru ini pada login berikutnya.
              </p>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-2.5">
                <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${isOwner ? 'text-amber-400' : 'text-blue-400'}`} />
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Setiap akun ({isOwner ? 'Owner' : 'Barista'}) memiliki PIN masing-masing untuk menjaga privasi & wewenang operasional shift.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Input 1: Old PIN */}
              <div className="space-y-1.5">
                <label className="block text-stone-300 font-semibold">
                  PIN Lama / Saat Ini:
                </label>
                <div className="relative">
                  <input
                    type={showPins ? 'text' : 'password'}
                    maxLength={6}
                    required
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan PIN saat ini..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500">
                  (PIN saat ini bawaan default: {currentPin})
                </p>
              </div>

              {/* Input 2: New PIN */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-stone-300 font-semibold">
                  PIN Baru (4 - 6 Angka):
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 5678"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Input 3: Confirm New PIN */}
              <div className="space-y-1.5">
                <label className="block text-stone-300 font-semibold">
                  Konfirmasi PIN Baru:
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ulangi PIN baru..."
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                    isOwner
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-amber-950'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-950'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Simpan PIN Baru</span>
                </button>
              </div>
            </>
          )}

        </form>

      </div>
    </div>
  );
};
