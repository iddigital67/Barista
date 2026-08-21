import React, { useState } from 'react';
import { 
  Coffee, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Trash2, 
  Package, 
  Layers, 
  ArrowRight, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { CafeSettings, UserRole } from '../../types';
import confetti from 'canvas-confetti';

interface LoginScreenProps {
  settings: CafeSettings;
  recipesCount: number;
  ingredientsCount: number;
  onLoginOwner: () => void;
  onLoginBarista: (baristaName: string, shift: string) => void;
  onOpenChangePinModal: (role: UserRole, targetUserName: string, currentPin: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  recipesCount,
  ingredientsCount,
  onLoginOwner,
  onLoginBarista,
  onOpenChangePinModal,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('barista');
  
  // Owner PIN State
  const [ownerPinInput, setOwnerPinInput] = useState('');
  const [showOwnerPin, setShowOwnerPin] = useState(false);
  const [ownerPinError, setOwnerPinError] = useState('');

  // Barista State
  const [selectedBarista, setSelectedBarista] = useState(settings.baristas[0] || 'Rian (Head Barista)');
  const [isCustomBarista, setIsCustomBarista] = useState(false);
  const [customBaristaName, setCustomBaristaName] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('Shift Pagi (Opening)');
  
  // Barista PIN State
  const [baristaPinInput, setBaristaPinInput] = useState('');
  const [showBaristaPin, setShowBaristaPin] = useState(false);
  const [baristaPinError, setBaristaPinError] = useState('');

  const shifts = [
    { id: 'Shift Pagi (Opening)', label: '🌅 Shift Pagi (Opening)', time: '07:00 - 15:00' },
    { id: 'Shift Siang (Peak)', label: '☀️ Shift Siang (Peak)', time: '12:00 - 20:00' },
    { id: 'Shift Malam (Closing)', label: '🌙 Shift Malam (Closing)', time: '15:00 - 23:00' },
  ];

  const currentBaristaTargetName = isCustomBarista ? customBaristaName.trim() : selectedBarista;
  const currentExpectedBaristaPin = settings.baristaPins?.[currentBaristaTargetName] || '1234';

  // Owner PIN Submission
  const handleOwnerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = settings.ownerPin || '1234';
    
    if (ownerPinInput.trim() === correctPin) {
      setOwnerPinError('');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      onLoginOwner();
    } else {
      setOwnerPinError('PIN Owner salah! Silakan coba lagi.');
      setOwnerPinInput('');
    }
  };

  const handleOwnerNumpadClick = (num: string) => {
    if (ownerPinInput.length < 6) {
      const newPin = ownerPinInput + num;
      setOwnerPinInput(newPin);
      setOwnerPinError('');
      const correctPin = settings.ownerPin || '1234';
      if (newPin === correctPin) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
        onLoginOwner();
      }
    }
  };

  // Barista Login Submission (with PIN verification)
  const handleBaristaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentBaristaTargetName) return;

    // Check Barista PIN
    const requiredPin = currentExpectedBaristaPin;
    if (baristaPinInput.trim() === requiredPin) {
      setBaristaPinError('');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      onLoginBarista(currentBaristaTargetName, selectedShift);
    } else {
      setBaristaPinError(`PIN untuk ${currentBaristaTargetName} salah! Coba lagi.`);
      setBaristaPinInput('');
    }
  };

  const handleBaristaNumpadClick = (num: string) => {
    if (baristaPinInput.length < 6) {
      const newPin = baristaPinInput + num;
      setBaristaPinInput(newPin);
      setBaristaPinError('');
      const requiredPin = currentExpectedBaristaPin;
      if (newPin === requiredPin) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
        onLoginBarista(currentBaristaTargetName, selectedShift);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Ambient background decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-radial from-amber-500/5 to-transparent pointer-events-none" />

      {/* Top Header Branding */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/40 border border-amber-400/30">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
              <span>BaristaCost</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-stone-400 font-medium truncate max-w-[200px] sm:max-w-md">
              {settings.cafeName}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Siap Operasional
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 py-6 sm:py-10 flex flex-col items-center">
        
        {/* Title & Subtitle */}
        <div className="text-center mb-6 sm:mb-8 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilih Akun & Masukkan PIN Masing-Masing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Selamat Datang di {settings.cafeName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Setiap user dapat menggunakan PIN masing-masing dan mengubahnya kapan saja.
          </p>
        </div>

        {/* Role Selector Tabs (Big Cards) */}
        <div className="w-full max-w-xl grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('barista');
              setBaristaPinError('');
              setBaristaPinInput('');
            }}
            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'barista'
                ? 'bg-gradient-to-br from-blue-950/70 to-stone-900 border-blue-500/80 shadow-lg shadow-blue-950/50 ring-2 ring-blue-500/20'
                : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedRole === 'barista' ? 'bg-blue-600 text-white font-bold' : 'bg-stone-800 text-stone-400'
              }`}>
                <User className="w-5 h-5" />
              </div>
              {selectedRole === 'barista' && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              )}
            </div>
            <div>
              <p className={`font-bold text-sm sm:text-base ${selectedRole === 'barista' ? 'text-white' : 'text-stone-300'}`}>
                ☕ Tim Barista
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                SOP Resep, Gramatur, Catat Waste (PIN Barista)
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('owner');
              setOwnerPinError('');
              setOwnerPinInput('');
            }}
            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'owner'
                ? 'bg-gradient-to-br from-amber-950/70 to-stone-900 border-amber-500/80 shadow-lg shadow-amber-950/50 ring-2 ring-amber-500/20'
                : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedRole === 'owner' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              {selectedRole === 'owner' && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </div>
            <div>
              <p className={`font-bold text-sm sm:text-base ${selectedRole === 'owner' ? 'text-white' : 'text-stone-300'}`}>
                👑 Owner / Manager
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                HPP, Margin %, Laba Rugi & Sheets (PIN Owner)
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Card Body based on Selected Role */}
        <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* BARISTA LOGIN FORM */}
          {selectedRole === 'barista' && (
            <form onSubmit={handleBaristaSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-stone-100 text-base">Masuk Operasional Barista</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChangePinModal('barista', currentBaristaTargetName, currentExpectedBaristaPin)}
                  className="text-[11px] text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 font-semibold flex items-center gap-1 transition-all"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Ganti PIN Barista Ini</span>
                </button>
              </div>

              {/* Barista Name Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Pilih Nama Barista Bertugas:
                </label>

                {!isCustomBarista ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {settings.baristas.map((name, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedBarista(name);
                          setBaristaPinInput('');
                          setBaristaPinError('');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 truncate ${
                          selectedBarista === name
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                            : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          selectedBarista === name ? 'bg-white text-blue-900 font-bold' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {name.charAt(0)}
                        </div>
                        <span className="truncate">{name}</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsCustomBarista(true)}
                      className="p-2.5 rounded-xl text-xs font-semibold border border-dashed border-stone-700 bg-stone-950/30 text-stone-400 hover:text-stone-200 hover:border-stone-600 text-center flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nama Lain</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customBaristaName}
                        onChange={(e) => setCustomBaristaName(e.target.value)}
                        placeholder="Ketik nama barista..."
                        autoFocus
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomBarista(false)}
                        className="px-3 py-2 text-xs text-stone-400 hover:text-stone-200 bg-stone-800 rounded-xl"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shift Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Pilih Shift Kerja:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {shifts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShift(s.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedShift === s.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-stone-200 truncate">{s.label}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Barista PIN Input Section */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>PIN Barista ({currentBaristaTargetName}):</span>
                  </label>
                  <span className="text-[10px] text-stone-400">
                    PIN default: <strong>{currentExpectedBaristaPin}</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showBaristaPin ? 'text' : 'password'}
                    maxLength={6}
                    value={baristaPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setBaristaPinInput(val);
                      setBaristaPinError('');
                      if (val === currentExpectedBaristaPin) {
                        confetti({
                          particleCount: 40,
                          spread: 60,
                          origin: { y: 0.7 }
                        });
                        onLoginBarista(currentBaristaTargetName, selectedShift);
                      }
                    }}
                    placeholder="Masukkan PIN Barista..."
                    className={`w-full px-4 py-2.5 bg-stone-900 border rounded-xl text-center text-lg tracking-[0.4em] font-mono font-bold text-blue-400 placeholder-stone-600 focus:outline-none transition-all ${
                      baristaPinError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : 'border-stone-700 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowBaristaPin(!showBaristaPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showBaristaPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {baristaPinError && (
                  <p className="text-xs text-rose-400 flex items-center justify-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{baristaPinError}</span>
                  </p>
                )}

                {/* Quick keypad or Fast login button */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setBaristaPinInput(currentExpectedBaristaPin);
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                      onLoginBarista(currentBaristaTargetName, selectedShift);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>⚡ Masuk Cepat (Gunakan PIN {currentExpectedBaristaPin})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenChangePinModal('barista', currentBaristaTargetName, currentExpectedBaristaPin)}
                    className="text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>Ganti PIN</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={(isCustomBarista && !customBaristaName.trim()) || baristaPinInput.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>Mulai Shift ({currentBaristaTargetName})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* OWNER LOGIN FORM */}
          {selectedRole === 'owner' && (
            <form onSubmit={handleOwnerSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-base">Autentikasi PIN Owner</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChangePinModal('owner', 'Owner / Management', settings.ownerPin || '1234')}
                  className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 font-semibold flex items-center gap-1 transition-all"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Ganti PIN Owner</span>
                </button>
              </div>

              {/* PIN Input Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300">
                  Masukkan PIN Keamanan Owner (4-6 Digit):
                </label>

                <div className="relative">
                  <input
                    type={showOwnerPin ? 'text' : 'password'}
                    maxLength={6}
                    value={ownerPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOwnerPinInput(val);
                      setOwnerPinError('');
                      if (val === (settings.ownerPin || '1234')) {
                        confetti({
                          particleCount: 50,
                          spread: 70,
                          origin: { y: 0.6 }
                        });
                        onLoginOwner();
                      }
                    }}
                    placeholder="••••"
                    autoFocus
                    className={`w-full px-4 py-3 bg-stone-950 border rounded-2xl text-center text-2xl tracking-[0.5em] font-bold text-amber-400 placeholder-stone-700 focus:outline-none transition-all ${
                      ownerPinError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : 'border-stone-700 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPin(!showOwnerPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showOwnerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {ownerPinError && (
                  <p className="text-xs text-rose-400 flex items-center justify-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{ownerPinError}</span>
                  </p>
                )}
              </div>

              {/* Touch Numpad (POS Style) */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleOwnerNumpadClick(digit)}
                    className="h-12 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-100 font-bold text-lg active:scale-95 transition-all shadow-sm"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOwnerPinInput('');
                    setOwnerPinError('');
                  }}
                  className="h-12 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 font-medium text-xs active:scale-95 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleOwnerNumpadClick('0')}
                  className="h-12 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-100 font-bold text-lg active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOwnerPinInput(prev => prev.slice(0, -1));
                    setOwnerPinError('');
                  }}
                  className="h-12 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-rose-400 font-bold text-sm active:scale-95 transition-all"
                >
                  ⌫
                </button>
              </div>

              {/* Hint Demo PIN */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                <span>PIN Owner: <strong>{settings.ownerPin || '1234'}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const defaultPin = settings.ownerPin || '1234';
                    setOwnerPinInput(defaultPin);
                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                    onLoginOwner();
                  }}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Gunakan PIN Owner ⚡
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={ownerPinInput.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-2xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Dashboard Owner</span>
              </button>

            </form>
          )}

        </div>

        {/* Highlights Banner */}
        <div className="w-full max-w-xl mt-6 grid grid-cols-3 gap-3 text-center text-stone-400 text-xs">
          <div className="p-3 rounded-2xl bg-stone-900/50 border border-stone-800/60">
            <span className="text-amber-400 font-bold text-sm sm:text-base block">{recipesCount} Menu</span>
            <span className="text-[11px]">Resep & HPP</span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-900/50 border border-stone-800/60">
            <span className="text-blue-400 font-bold text-sm sm:text-base block">{ingredientsCount} Bahan</span>
            <span className="text-[11px]">Inventori Gudang</span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-900/50 border border-stone-800/60">
            <span className="text-emerald-400 font-bold text-sm sm:text-base block">Sheets Live</span>
            <span className="text-[11px]">Sinkronisasi Otomatis</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 text-center text-xs text-stone-400 border-t border-stone-900">
        <p>
          BaristaCost • Sistem Standarisasi HPP, Resep & Pengendalian Waste Cafe
        </p>
      </footer>

    </div>
  );
};
