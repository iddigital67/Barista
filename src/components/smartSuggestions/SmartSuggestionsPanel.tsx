import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Coffee, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  UtensilsCrossed, 
  Package, 
  RefreshCw,
  ShoppingBag,
  Zap,
  Tag
} from 'lucide-react';
import { Ingredient, Recipe, WasteLog, CafeSettings } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo, getDaysUntilExpiry } from '../../utils/formatters';

export interface SmartSuggestionItem {
  id: string;
  type: 'stock_depletion' | 'expiry_push' | 'waste_reduction' | 'margin_boost' | 'dial_in';
  priority: 'high' | 'medium' | 'low';
  title: string;
  subtitle: string;
  description: string;
  actionText?: string;
  actionType?: 'view_ingredient' | 'view_recipe' | 'view_waste' | 'reorder';
  targetId?: string;
  highlightNumber?: string;
  highlightLabel?: string;
  badge: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

interface SmartSuggestionsPanelProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  onNavigate?: (tab: any) => void;
  compact?: boolean;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  ingredients,
  recipes,
  wasteLogs,
  settings,
  onNavigate,
  compact = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'expiry' | 'waste' | 'margin'>('all');

  // Compute smart suggestions dynamically based on real data
  const suggestions: SmartSuggestionItem[] = [];

  // 1. ANALISIS STOK MENIPIS & SISA GELAS / PORSI (Stock Depletion & Portion Remaining)
  ingredients.forEach(ing => {
    // Cari resep-resep yang menggunakan bahan ini
    const relatedRecipes = recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ing.id)
    );

    if (relatedRecipes.length > 0) {
      // Ambil menu paling populer atau menu utama
      const mainRecipe = relatedRecipes.find(r => r.isPopular) || relatedRecipes[0];
      const recipeItem = mainRecipe.ingredients.find(ri => ri.ingredientId === ing.id);
      
      if (recipeItem && recipeItem.amount > 0) {
        const remainingPortions = Math.floor(ing.currentStock / recipeItem.amount);
        const isCriticalStock = ing.currentStock <= ing.minStockAlert;
        const isLowPortion = remainingPortions <= 25; // Kurang dari 25 cup

        if (isCriticalStock || isLowPortion) {
          suggestions.push({
            id: `sug-stock-${ing.id}`,
            type: 'stock_depletion',
            priority: remainingPortions <= 10 ? 'high' : 'medium',
            title: `Stok ${ing.name} Sisa ${ing.currentStock} ${ing.usageUnit}`,
            subtitle: `Hanya cukup untuk ~${remainingPortions} porsi/gelas "${mainRecipe.name}"`,
            description: `Berdasarkan SOP resep (${recipeItem.amount} ${recipeItem.unit}/cup), stok ini diperkirakan habis dalam 1-2 hari operasional. Segera hubungi supplier ${ing.supplier ? `(${ing.supplier})` : ''} untuk restock agar menu tidak terpaksa Sold Out.`,
            actionText: 'Lihat Stok Bahan',
            actionType: 'view_ingredient',
            targetId: ing.id,
            highlightNumber: `~${remainingPortions} Gelas`,
            highlightLabel: 'Sisa Porsi',
            badge: remainingPortions <= 10 ? '🚨 Kritis' : '⚠️ Stok Menipis',
            iconColor: 'text-amber-400',
            bgColor: 'bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900',
            borderColor: remainingPortions <= 10 ? 'border-red-500/60' : 'border-amber-700/50'
          });
        }
      }
    }
  });

  // 2. ANALISIS KADALUARSA MENDEKATI & SARAN PROMO / MENU PENDORONG (Expiry Push)
  ingredients.forEach(ing => {
    const days = getDaysUntilExpiry(ing.expiryDate);
    if (days !== null && days >= 0 && days <= 14) {
      // Temukan menu yang memakai bahan ini
      const relatedRecipes = recipes.filter(r => 
        r.ingredients.some(ri => ri.ingredientId === ing.id)
      );
      const menuNames = relatedRecipes.map(r => `"${r.name}"`).join(' atau ');

      suggestions.push({
        id: `sug-exp-${ing.id}`,
        type: 'expiry_push',
        priority: days <= 4 ? 'high' : 'medium',
        title: `${ing.name} Expired ${days === 0 ? 'HARI INI!' : `${days} Hari Lagi`}`,
        subtitle: `Rekomendasi Flash Sale / Promo Menu ${menuNames || 'Terkait'}`,
        description: `Tersisa ${ing.currentStock} ${ing.usageUnit} (senilai ${formatRupiah(ing.currentStock * ing.costPerUsageUnit)}) yang berisiko terbuang jadi waste bila tidak segera dihabiskan. Buat promo bundling / Upselling barista di meja kasir hari ini.`,
        actionText: 'Atur Promo Menu',
        actionType: 'view_recipe',
        targetId: relatedRecipes[0]?.id,
        highlightNumber: days === 0 ? 'Hari Ini' : `${days} Hari`,
        highlightLabel: 'Sisa Waktu Exp',
        badge: days <= 4 ? '🔥 Promo Segera' : '⏱️ Dekat Expired',
        iconColor: 'text-rose-400',
        bgColor: 'bg-gradient-to-br from-rose-950/40 via-stone-900 to-stone-900',
        borderColor: 'border-rose-700/50'
      });
    }
  });

  // 3. ANALISIS POLA WASTE TERTINGGI & SOP KOREKTIF (Waste Reduction)
  const wasteByIngredient: { [name: string]: { cost: number; logs: WasteLog[] } } = {};
  wasteLogs.forEach(w => {
    if (!wasteByIngredient[w.ingredientName]) {
      wasteByIngredient[w.ingredientName] = { cost: 0, logs: [] };
    }
    wasteByIngredient[w.ingredientName].cost += w.costLost || 0;
    wasteByIngredient[w.ingredientName].logs.push(w);
  });

  const sortedWaste = Object.entries(wasteByIngredient).sort((a, b) => b[1].cost - a[1].cost);
  if (sortedWaste.length > 0 && sortedWaste[0][1].cost > 20000) {
    const topWasteName = sortedWaste[0][0];
    const topWasteData = sortedWaste[0][1];
    const mainReason = topWasteData.logs[0]?.reason || 'Overprep';

    suggestions.push({
      id: `sug-waste-top`,
      type: 'waste_reduction',
      priority: 'high',
      title: `Kebocoran Terbesar: ${topWasteName}`,
      subtitle: `Total kerugian Rp ${topWasteData.cost.toLocaleString('id-ID')} (${topWasteData.logs.length} kali pencatatan waste)`,
      description: `Alasan dominan: "${mainReason}". Terapkan SOP penimbangan gramasi ketat dan evaluasi ukuran container/pitcher saat shift closing untuk menghemat hingga 80% biaya bahan.`,
      actionText: 'Lihat Analisa Waste',
      actionType: 'view_waste',
      highlightNumber: formatRupiah(topWasteData.cost),
      highlightLabel: 'Kerugian Waste',
      badge: '🛡️ Efisiensi Biaya',
      iconColor: 'text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-950/30 via-stone-900 to-stone-900',
      borderColor: 'border-amber-600/40'
    });
  }

  // 4. ANALISIS MARGIN RENDAH & PELUANG PENYESUAIAN HARGA (Margin Optimization)
  const lowMarginRecipes = recipes.filter(r => r.status === 'Active' && r.actualMarginPercent < settings.defaultTargetMargin);
  if (lowMarginRecipes.length > 0) {
    const worstMarginMenu = lowMarginRecipes.sort((a, b) => a.actualMarginPercent - b.actualMarginPercent)[0];
    const recommendedPrice = worstMarginMenu.recommendedSellingPrice || Math.ceil((worstMarginMenu.totalHpp / (1 - (settings.defaultTargetMargin / 100))) / 1000) * 1000;
    const priceDiff = recommendedPrice - worstMarginMenu.sellingPrice;

    if (priceDiff > 0) {
      suggestions.push({
        id: `sug-margin-${worstMarginMenu.id}`,
        type: 'margin_boost',
        priority: 'medium',
        title: `Optimasi Margin Menu: "${worstMarginMenu.name}"`,
        subtitle: `Margin saat ini hanya ${formatPercent(worstMarginMenu.actualMarginPercent, 1)} (Target: ${settings.defaultTargetMargin}%)`,
        description: `Total HPP menu ini adalah ${formatRupiah(worstMarginMenu.totalHpp)}. Naikkan harga jual dari ${formatRupiah(worstMarginMenu.sellingPrice)} ke ${formatRupiah(recommendedPrice)} (+${formatRupiah(priceDiff)}) untuk mencapai margin ideal ${settings.defaultTargetMargin}%.`,
        actionText: 'Sesuaikan Harga Menu',
        actionType: 'view_recipe',
        targetId: worstMarginMenu.id,
        highlightNumber: `+${formatRupiah(priceDiff)}`,
        highlightLabel: 'Potensi Kenaikan Harga',
        badge: '📈 Kerek Margin',
        iconColor: 'text-emerald-400',
        bgColor: 'bg-gradient-to-br from-emerald-950/30 via-stone-900 to-stone-900',
        borderColor: 'border-emerald-700/50'
      });
    }
  }

  // 5. DIAL-IN & BEANS BATCH SUGGESTION
  const coffeeBeans = ingredients.filter(i => i.category === 'Kopi & Espresso');
  if (coffeeBeans.length > 0) {
    suggestions.push({
      id: 'sug-dial-in',
      type: 'dial_in',
      priority: 'low',
      title: 'Standar Kalibrasi Grinder & Dial-in Pagi',
      subtitle: 'Maksimal 3-4 shot per opening untuk efisiensi biji kopi',
      description: 'Catat waktu ekstraksi (25-30 detik) dan rasio brew (misal 1:2 / 18gr in : 36gr out) di papan stasiun espresso agar barista shift siang tidak perlu kalibrasi ulang.',
      actionText: 'Lihat SOP Bar',
      actionType: 'view_recipe',
      highlightNumber: '25-30 dtk',
      highlightLabel: 'Target Ekstraksi',
      badge: '☕ SOP Barista',
      iconColor: 'text-stone-300',
      bgColor: 'bg-stone-900',
      borderColor: 'border-stone-800'
    });
  }

  // Filtered suggestions
  const filteredSuggestions = suggestions.filter(s => {
    if (filterType === 'stock') return s.type === 'stock_depletion';
    if (filterType === 'expiry') return s.type === 'expiry_push';
    if (filterType === 'waste') return s.type === 'waste_reduction';
    if (filterType === 'margin') return s.type === 'margin_boost';
    return true;
  });

  const handleActionClick = (sug: SmartSuggestionItem) => {
    if (!onNavigate) return;
    if (sug.actionType === 'view_ingredient') onNavigate('ingredients');
    else if (sug.actionType === 'view_recipe') onNavigate('hpp');
    else if (sug.actionType === 'view_waste') onNavigate('waste');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-stone-100 tracking-tight">
                Kolom Saran Cerdas & Sisa Porsi
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                {suggestions.length} Rekomendasi Aktif
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Analisis otomatis stok menipis, estimasi gelas tersisa, risiko expired, dan rekomendasi margin.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        {!compact && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Semua ({suggestions.length})
            </button>
            <button
              onClick={() => setFilterType('stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'stock'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              🥤 Sisa Gelas/Stok
            </button>
            <button
              onClick={() => setFilterType('expiry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'expiry'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              ⏱️ Promo Expired
            </button>
            <button
              onClick={() => setFilterType('waste')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'waste'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              🛡️ Reduksi Waste
            </button>
            <button
              onClick={() => setFilterType('margin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'margin'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              📈 Margin Menu
            </button>
          </div>
        )}
      </div>

      {/* Suggestion Cards Grid */}
      {filteredSuggestions.length === 0 ? (
        <div className="p-8 text-center bg-stone-950/40 border border-dashed border-stone-800 rounded-2xl text-stone-400">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/60 mb-2" />
          <p className="text-sm font-semibold text-stone-200">Kondisi Operasional Prima!</p>
          <p className="text-xs text-stone-500 mt-0.5">Seluruh stok bahan aman, belum ada bahan kritis, dan margin resep optimal.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'md:grid-cols-2 gap-4'}`}>
          {filteredSuggestions.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border ${item.bgColor} ${item.borderColor} shadow-sm transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3 group`}
            >
              <div className="space-y-2">
                
                {/* Top Badge & Metric Box */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-stone-900/80 text-stone-200 ${item.borderColor}`}>
                    {item.badge}
                  </span>

                  {item.highlightNumber && (
                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-300 block leading-tight">
                        {item.highlightNumber}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">
                        {item.highlightLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs font-semibold text-amber-400/90 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-300 leading-relaxed pt-1">
                  {item.description}
                </p>

              </div>

              {/* Action Button */}
              {item.actionText && (
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Rekomendasi Barista:</span>
                  <button
                    onClick={() => handleActionClick(item)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
