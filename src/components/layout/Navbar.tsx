import React, { useState } from 'react';
import { 
  Coffee, 
  Trash2, 
  Calculator, 
  Package, 
  FileSpreadsheet, 
  BarChart3, 
  Settings as SettingsIcon,
  RefreshCw,
  Plus,
  ShieldCheck,
  User,
  ChevronDown,
  Lock,
  Sparkles,
  LogOut,
  KeyRound
} from 'lucide-react';
import { GoogleSheetsConfig, UserRole } from '../../types';

interface NavbarProps {
  cafeName: string;
  sheetsConfig: GoogleSheetsConfig;
  userRole: UserRole;
  currentBaristaName: string;
  baristas: string[];
  onChangeBarista: (name: string) => void;
  onOpenOwnerAuth: () => void;
  onSwitchToBarista: () => void;
  onOpenQuickWaste: () => void;
  onOpenSheetsModal: () => void;
  onOpenSettings: () => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
  todayWasteCost: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cafeName,
  sheetsConfig,
  userRole,
  currentBaristaName,
  baristas,
  onChangeBarista,
  onOpenOwnerAuth,
  onSwitchToBarista,
  onOpenQuickWaste,
  onOpenSheetsModal,
  onOpenSettings,
  onOpenChangePin,
  onLogout,
  todayWasteCost,
}) => {
  const [isBaristaMenuOpen, setIsBaristaMenuOpen] = useState(false);

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Cafe Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base sm:text-lg text-amber-50 tracking-tight leading-none">
                  BaristaCost
                </h1>
                <span className={`text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded border ${
                  userRole === 'owner'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  {userRole === 'owner' ? '👑 OWNER' : '☕ BARISTA'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium truncate max-w-[120px] sm:max-w-xs">
                {cafeName}
              </p>
            </div>
          </div>

          {/* Center / Right Role Switcher & Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Role Switcher Pill */}
            {userRole === 'owner' ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onSwitchToBarista}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  title="Klik untuk beralih ke Mode Barista / Karyawan"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Owner</span>
                  <span className="text-[10px] text-stone-400 bg-stone-900/80 px-1 rounded">Ubah</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-1 bg-stone-800/80 border border-stone-700/80 rounded-xl p-0.5">
                  {/* Select Barista Dropdown button */}
                  <button
                    onClick={() => setIsBaristaMenuOpen(!isBaristaMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-stone-200 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[80px] sm:max-w-[110px]">
                      {currentBaristaName || 'Barista'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {/* Switch to Owner Button */}
                  <button
                    onClick={onOpenOwnerAuth}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all"
                    title="Buka akses Owner dengan PIN"
                  >
                    <Lock className="w-3 h-3" />
                    <span className="hidden sm:inline">Owner PIN</span>
                  </button>
                </div>

                {/* Dropdown Menu to change active Barista */}
                {isBaristaMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1">
                      Pilih Barista Bertugas:
                    </p>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                      {baristas.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onChangeBarista(name);
                            setIsBaristaMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                            currentBaristaName === name
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-stone-300 hover:bg-stone-800'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          {currentBaristaName === name && <span className="text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-800 space-y-1">
                      <button
                        onClick={() => {
                          setIsBaristaMenuOpen(false);
                          onOpenChangePin();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Ganti PIN ({currentBaristaName})</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsBaristaMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar / Ganti Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google Sheets Status Badge (Shown for Owner) */}
            {userRole === 'owner' && (
              <button
                onClick={onOpenSheetsModal}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sheetsConfig.webAppUrl
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                }`}
                title="Integrasi Google Sheets & Apps Script"
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${sheetsConfig.webAppUrl ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span className="hidden lg:inline">
                  {sheetsConfig.webAppUrl ? 'Sheets Live' : 'Sambungkan Sheet'}
                </span>
                <span className={`w-2 h-2 rounded-full ${sheetsConfig.webAppUrl ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`}></span>
              </button>
            )}

            {/* Quick Waste Log Button (Hero Action - Available for All Roles) */}
            <button
              onClick={onOpenQuickWaste}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-900/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat Waste</span>
            </button>

            {/* Change PIN Button (Dedicated for current logged in user) */}
            <button
              onClick={onOpenChangePin}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                userRole === 'owner'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
              title={`Ganti PIN Saya (${userRole === 'owner' ? 'Owner' : currentBaristaName})`}
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Settings button (Owner only or triggers PIN for barista) */}
            <button
              onClick={userRole === 'owner' ? onOpenSettings : onOpenOwnerAuth}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              title={userRole === 'owner' ? 'Pengaturan Cafe' : 'Buka Pengaturan (Perlu PIN Owner)'}
            >
              {userRole === 'owner' ? <SettingsIcon className="w-4 h-4" /> : <Lock className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Logout / Exit Button to Switch Mode */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 hover:text-rose-300 text-stone-400 border border-stone-700 rounded-xl text-xs font-semibold transition-all"
              title="Keluar untuk kembali ke Halaman Login & Pemilihan Peran"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
