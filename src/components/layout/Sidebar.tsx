import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Trash2, 
  Package, 
  FileSpreadsheet, 
  FileText, 
  TrendingDown, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  BookOpen,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 'dashboard' | 'hpp' | 'waste' | 'ingredients' | 'sheets' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  wasteCountToday: number;
  lowStockCount: number;
  userRole: UserRole;
  currentBaristaName: string;
  onOpenOwnerAuth: () => void;
  onSwitchToBarista: () => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  wasteCountToday,
  lowStockCount,
  userRole,
  currentBaristaName,
  onOpenOwnerAuth,
  onSwitchToBarista,
  onOpenChangePin,
  onLogout,
}) => {
  const isOwner = userRole === 'owner';

  const navItems = isOwner ? [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Finansial',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'hpp' as NavTab,
      label: 'HPP & Resep Menu',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'waste' as NavTab,
      label: 'Analisa & Log Waste',
      icon: Trash2,
      badge: wasteCountToday > 0 ? `${wasteCountToday} hari ini` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'ingredients' as NavTab,
      label: 'Bahan Baku & Biaya',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} menipis` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'sheets' as NavTab,
      label: 'Google Sheets & Script',
      icon: FileSpreadsheet,
      badge: 'Database',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan & Print SOP',
      icon: FileText,
      badge: null,
    },
  ] : [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Barista',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'hpp' as NavTab,
      label: 'SOP Resep Barista',
      icon: BookOpen,
      badge: 'SOP Takaran',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'waste' as NavTab,
      label: 'Catatan Waste Shift',
      icon: Trash2,
      badge: wasteCountToday > 0 ? `${wasteCountToday} dicatat` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'ingredients' as NavTab,
      label: 'Sisa Stok & Porsi',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} habis` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-stone-900 border-r border-stone-800 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Role Profile Box */}
      <div className="mb-4 p-3 rounded-2xl bg-stone-950/70 border border-stone-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Akses Pengguna
          </span>
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
            isOwner
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {isOwner ? '👑 Owner' : '☕ Barista'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            isOwner ? 'bg-amber-500 text-stone-950' : 'bg-blue-500 text-stone-950'
          }`}>
            {isOwner ? '👑' : '☕'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-stone-200 truncate">
              {isOwner ? 'Management / Owner' : currentBaristaName || 'Barista Shift'}
            </p>
            <p className="text-[10px] text-stone-400">
              {isOwner ? 'Akses Penuh Finansial' : 'Mode Operasional Bar'}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-stone-800/70 space-y-1.5">
          {isOwner ? (
            <button
              onClick={onSwitchToBarista}
              className="w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Beralih ke Barista Mode</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerAuth}
              className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30"
            >
              <Lock className="w-3 h-3" />
              <span>Masuk Mode Owner (PIN)</span>
            </button>
          )}

          {/* Change PIN for currently logged in user */}
          <button
            onClick={onOpenChangePin}
            className="w-full py-1.5 px-2 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-stone-700/60"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Ganti PIN Saya</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-1.5 px-2 bg-stone-900 hover:bg-rose-500/10 text-stone-400 hover:text-rose-400 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-stone-800"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar / Ganti Akun</span>
          </button>
        </div>
      </div>

      <div className="mb-2 px-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Menu Navigasi
        </p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? isOwner
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 font-semibold'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-semibold'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-black/30 text-white border-white/20'
                      : item.badgeColor || 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tip Box at bottom of sidebar */}
      <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-stone-800/80 to-stone-800/40 border border-stone-700/60 text-stone-300">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{isOwner ? 'Management Guard' : 'Barista Best Practice'}</span>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          {isOwner
            ? 'Data HPP, margin profit %, dan database Google Sheets terlindungi dari akses publik.'
            : 'Timbang dose & yield kopi secara presisi, lalu segera catat jika ada waste/susu tumpah.'}
        </p>
      </div>

    </aside>
  );
};
