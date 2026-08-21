import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  PieChart as PieIcon, 
  Coffee, 
  UtensilsCrossed, 
  Trash2, 
  Package, 
  FileSpreadsheet, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  User,
  BookOpen,
  Lock
} from 'lucide-react';
import { Ingredient, Recipe, WasteLog, CafeSettings, GoogleSheetsConfig, UserRole } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo, getDaysUntilExpiry } from '../../utils/formatters';
import { SmartSuggestionsPanel } from '../smartSuggestions/SmartSuggestionsPanel';

interface DashboardOverviewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  sheetsConfig: GoogleSheetsConfig;
  userRole?: UserRole;
  currentBaristaName?: string;
  onNavigate: (tab: any) => void;
  onOpenQuickWaste: () => void;
  onOpenRecipeModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenOwnerAuth?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  ingredients,
  recipes,
  wasteLogs,
  settings,
  sheetsConfig,
  userRole = 'owner',
  currentBaristaName = 'Barista Shift',
  onNavigate,
  onOpenQuickWaste,
  onOpenRecipeModal,
  onOpenSheetsModal,
  onOpenOwnerAuth,
}) => {
  const isOwner = userRole === 'owner';
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter waste
  const todayWasteLogs = wasteLogs.filter(w => w.date === todayStr);
  const monthWasteLogs = wasteLogs.filter(w => w.date && w.date.startsWith(currentMonthStr));

  const todayWasteCost = todayWasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const monthWasteCost = monthWasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);

  // Compute average HPP & Margin
  const activeRecipes = recipes.filter(r => r.status === 'Active');
  const avgMargin = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + (r.actualMarginPercent || 0), 0) / activeRecipes.length
    : 65;
  const avgHppPercent = 100 - avgMargin;

  // Monthly potential
  const estMonthlyRevenue = activeRecipes.reduce((sum, r) => sum + ((r.sellingPrice || 0) * (r.estimatedSalesPerMonth || 0)), 0) || settings.monthlyRevenueTarget;
  const estMonthlyHppCost = activeRecipes.reduce((sum, r) => sum + ((r.totalHpp || 0) * (r.estimatedSalesPerMonth || 0)), 0);
  const estMonthlyGrossProfit = estMonthlyRevenue - estMonthlyHppCost;

  const wastePercentOfHpp = estMonthlyHppCost > 0 ? (monthWasteCost / estMonthlyHppCost) * 100 : 0;
  const isWasteOverTolerance = wastePercentOfHpp > settings.maxWasteTolerancePercent;

  // Low stock & Expiry items
  const lowStockItems = ingredients.filter(i => i.currentStock <= i.minStockAlert);
  const nearExpiryItems = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate);
    return days !== null && days >= 0 && days <= 14;
  });

  // Pareto waste: Top 5 materials by cost lost
  const wasteByIngredient: { [name: string]: { cost: number; amount: number; unit: string; category: string } } = {};
  wasteLogs.forEach(w => {
    if (!wasteByIngredient[w.ingredientName]) {
      wasteByIngredient[w.ingredientName] = { cost: 0, amount: 0, unit: w.unit, category: w.category };
    }
    wasteByIngredient[w.ingredientName].cost += w.costLost || 0;
    wasteByIngredient[w.ingredientName].amount += w.amount || 0;
  });

  const sortedWasteIngredients = Object.entries(wasteByIngredient)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.cost - a.cost);

  const totalAllWasteCost = wasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0) || 1;

  // Waste reasons breakdown
  const wasteByReason: { [reason: string]: number } = {};
  wasteLogs.forEach(w => {
    wasteByReason[w.reason] = (wasteByReason[w.reason] || 0) + (w.costLost || 0);
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className={`border rounded-3xl p-6 sm:p-8 text-stone-100 relative overflow-hidden shadow-xl ${
        isOwner
          ? 'bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950/70 border-stone-800'
          : 'bg-gradient-to-r from-stone-900 via-stone-850 to-blue-950/60 border-blue-900/40'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/90 border border-stone-700 text-stone-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isOwner ? 'Mode Owner: Dashboard Finansial & HPP' : `Mode Barista: Operasional Bar — Shift ${currentBaristaName}`}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {settings.cafeName}
            </h2>
            <p className="text-sm text-stone-300 max-w-xl">
              {isOwner
                ? 'Pantau biaya bahan pokok (COGS), margin keuntungan tiap menu, dan kendalikan kebocoran waste bahan baku secara real-time.'
                : 'Pantau stok bahan di bar, cek standar gramatur takaran resep, dan segera catat jika ada bahan sisa/tumpah.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickWaste}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/30 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Catat Waste Barista</span>
            </button>

            {isOwner ? (
              <button
                onClick={() => onNavigate('hpp')}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold rounded-xl border border-stone-700 active:scale-95 transition-all"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Kalkulator HPP</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('hpp')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/30 active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka SOP Resep</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Waste Tracker */}
        <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {isOwner ? 'Waste Bulan Ini' : 'Waste Hari Ini'}
            </span>
            <div className={`p-2 rounded-xl ${isWasteOverTolerance ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
              <Trash2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-100">
              {isOwner ? formatRupiah(monthWasteCost) : `${todayWasteLogs.length} Catatan Waste`}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {isOwner ? (
                <span className={`font-semibold px-2 py-0.5 rounded-md ${
                  isWasteOverTolerance 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {formatPercent(wastePercentOfHpp, 2)} dari HPP
                </span>
              ) : (
                <span className="text-stone-300">
                  Total Terbuang Hari Ini: <strong className="text-amber-400">{formatRupiah(todayWasteCost)}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <span>{isOwner ? `Hari ini: ${formatRupiah(todayWasteCost)}` : 'Shift Aktif'}</span>
            <button onClick={() => onNavigate('waste')} className="text-amber-400 hover:underline flex items-center gap-0.5">
              Lihat Log <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Food Cost (Owner) vs Menu Aktif (Barista) */}
        {isOwner ? (
          <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Rata-Rata HPP (COGS)
              </span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <PieIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-100">
                {formatPercent(avgHppPercent, 1)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-300">
                <span className="font-semibold text-emerald-400">
                  Laba Kotor {formatPercent(avgMargin, 1)}
                </span>
                <span className="text-stone-400">• {activeRecipes.length} menu aktif</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Target Margin: <strong className="text-stone-200">{settings.defaultTargetMargin}%</strong></span>
              <button onClick={() => onNavigate('hpp')} className="text-amber-400 hover:underline flex items-center gap-0.5">
                Atur Menu <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Resep & Menu Aktif
              </span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-100">
                {activeRecipes.length} Menu Siap Saji
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-300">
                <span className="text-emerald-400 font-semibold">Semua SOP Gramatur Tersedia</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Cek Standar Takaran</span>
              <button onClick={() => onNavigate('hpp')} className="text-amber-400 hover:underline flex items-center gap-0.5">
                Buka Resep <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Card 3: Est Laba Kotor (Owner) vs Barista Shift (Barista) */}
        {isOwner ? (
          <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Est. Laba Kotor / Bln
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-400">
                {formatRupiah(estMonthlyGrossProfit)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-300">
                <span className="text-stone-400">Dari Omset:</span>
                <span className="font-medium text-stone-200">{formatRupiah(estMonthlyRevenue)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Fixed Cost: <strong className="text-stone-200">{formatRupiah(settings.monthlyFixedCost)}</strong></span>
              <button onClick={() => onNavigate('reports')} className="text-amber-400 hover:underline flex items-center gap-0.5">
                Laporan <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Barista Bertugas
              </span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <User className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-100 truncate">
                {currentBaristaName}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-300">
                <span className="text-blue-400 font-semibold">Tanggung Jawab Bar Shift</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Total Barista: {settings.baristas.length} orang</span>
              <button onClick={onOpenOwnerAuth} className="text-amber-400 hover:underline flex items-center gap-0.5">
                Mode Owner <Lock className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Card 4: Status Bahan & Restock Alert */}
        <div className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 rounded-2xl shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Alert Stok & Expired
            </span>
            <div className={`p-2 rounded-xl ${
              lowStockItems.length > 0 || nearExpiryItems.length > 0
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-stone-800 text-stone-400'
            }`}>
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-100 flex items-center gap-2">
              <span>{lowStockItems.length + nearExpiryItems.length} Perlu Cek</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${
                lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
              }`}>
                {lowStockItems.length} Menipis
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${
                nearExpiryItems.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-stone-800 text-stone-400'
              }`}>
                {nearExpiryItems.length} Kedaluwarsa
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <span>Stok Fisik Bar</span>
            <button onClick={() => onNavigate('ingredients')} className="text-amber-400 hover:underline flex items-center gap-0.5">
              Cek Gudang <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Smart Suggestions Panel (Owner only for strategic financial optimization) */}
      {isOwner && (
        <SmartSuggestionsPanel
          ingredients={ingredients}
          recipes={recipes}
          wasteLogs={wasteLogs}
          settings={settings}
          onNavigate={onNavigate}
        />
      )}

      {/* Middle Grid: Actionable Low Stock & Waste Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Urgent Stock & Expiry Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-100 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Bahan Baku Perlu Restock / Segera Dipakai</span>
            </div>
            <button
              onClick={() => onNavigate('ingredients')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Lihat Semua ({ingredients.length})
            </button>
          </div>

          {lowStockItems.length === 0 && nearExpiryItems.length === 0 ? (
            <div className="p-8 text-center bg-stone-950/40 rounded-2xl border border-stone-800/60 text-stone-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-stone-200">Semua Stok Bahan Aman</p>
              <p className="text-xs text-stone-500 mt-0.5">Tidak ada bahan yang berada di bawah batas minimum atau mendekati kedaluwarsa.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-100 block">{item.name}</span>
                    <span className="text-[11px] text-stone-400">
                      Sisa: <strong className="text-amber-400">{item.currentStock} {item.usageUnit}</strong> (Min Alert: {item.minStockAlert} {item.usageUnit})
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    Stok Menipis
                  </span>
                </div>
              ))}

              {nearExpiryItems.map((item) => {
                const days = getDaysUntilExpiry(item.expiryDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-100 block">{item.name}</span>
                      <span className="text-[11px] text-stone-400">
                        Kedaluwarsa: <strong className="text-rose-400">{item.expiryDate ? formatDateIndo(item.expiryDate) : '-'}</strong> ({days} hari lagi)
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                      Cek Expired
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pareto: Top Waste Materials */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-100 font-bold text-base">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Top Bahan Paling Banyak Terbuang (Pareto)</span>
            </div>
            <button
              onClick={() => onNavigate('waste')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Semua Waste ({wasteLogs.length})
            </button>
          </div>

          {sortedWasteIngredients.length === 0 ? (
            <div className="p-8 text-center bg-stone-950/40 rounded-2xl border border-stone-800/60 text-stone-400">
              <Sparkles className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-stone-200">Belum Ada Catatan Waste</p>
              <p className="text-xs text-stone-500 mt-0.5">Semua bahan baku tercatat aman dan terkendali.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedWasteIngredients.slice(0, 4).map((item, idx) => {
                const percentOfTotal = totalAllWasteCost > 0 ? (item.cost / totalAllWasteCost) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-stone-200">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-400">{formatRupiah(item.cost)}</span>
                        <span className="text-[11px] text-stone-500 ml-1.5">({item.amount} {item.unit})</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(8, percentOfTotal))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
