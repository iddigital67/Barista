import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  Trash2, 
  Edit3, 
  Copy, 
  Printer, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpDown, 
  Sparkles, 
  Sliders, 
  DollarSign,
  Layers
} from 'lucide-react';
import { Recipe, Ingredient, MenuCategory, UserRole } from '../../types';
import { formatRupiah, formatPercent, formatNumber } from '../../utils/formatters';
import { RecipeModal } from './RecipeModal';
import { RecipePrintCard } from './RecipePrintCard';

interface HppCalculatorProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  defaultTargetMargin: number;
  cafeName: string;
  userRole?: UserRole;
  onOpenOwnerAuth?: () => void;
}

const CATEGORIES: ('All' | MenuCategory)[] = [
  'All',
  'Coffee (Hot/Iced)',
  'Non-Coffee & Milk Based',
  'Manual Brew & Tea',
  'Mocktail & Refreshment',
  'Pastry & Bakery',
  'Main Course & Meals',
  'Snacks & Finger Food',
];

export const HppCalculator: React.FC<HppCalculatorProps> = ({
  recipes,
  ingredients,
  onSaveRecipe,
  onDeleteRecipe,
  defaultTargetMargin,
  cafeName,
  userRole = 'owner',
  onOpenOwnerAuth,
}) => {
  const isOwner = userRole === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [sortBy, setSortBy] = useState<'margin' | 'hpp' | 'price' | 'sales'>('margin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [printingRecipe, setPrintingRecipe] = useState<Recipe | null>(null);

  // Price simulator state (What-if scenario)
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatedIngredientId, setSimulatedIngredientId] = useState(ingredients[0]?.id || '');
  const [priceChangePercent, setPriceChangePercent] = useState(15); // e.g. +15%

  // Filter & Sort recipes
  const filteredRecipes = recipes
    .filter(r => {
      const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'margin') return b.actualMarginPercent - a.actualMarginPercent;
      if (sortBy === 'hpp') return b.totalHpp - a.totalHpp;
      if (sortBy === 'price') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'sales') return (b.estimatedSalesPerMonth || 0) - (a.estimatedSalesPerMonth || 0);
      return 0;
    });

  const handleDuplicate = (recipe: Recipe) => {
    const dup: Recipe = {
      ...recipe,
      id: `rec-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onSaveRecipe(dup);
  };

  const handleOpenAdd = () => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  // Simulator calculations
  const simIngredient = ingredients.find(i => i.id === simulatedIngredientId);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-amber-500" />
            <span>{isOwner ? 'Kalkulator HPP & Resep Menu' : 'SOP Resep & Takaran Barista'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            {isOwner 
              ? 'Standarisasi resep (BOM), kalkulasi modal per porsi, dan monitoring margin laba kotor cafe.'
              : 'Panduan takaran gramatur baku, langkah peracikan SOP, dan ukuran sajian untuk barista.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setSimulatorOpen(!simulatorOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                simulatorOpen
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulator Kenaikan Harga</span>
            </button>
          )}

          {isOwner ? (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Menu Baru</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerAuth}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5 transition-all"
              title="Perlu PIN Owner untuk edit resep"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Kalkulasi HPP (PIN)</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulator Panel (Collapsible) */}
      {simulatorOpen && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-amber-950/40 border border-amber-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Simulasi Dampak Kenaikan Harga Bahan Baku (Stress Test)</span>
            </div>
            <span className="text-xs text-stone-400">
              Lihat pengaruh inflasi supplier terhadap profit menu Anda.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">Pilih Bahan Baku:</label>
              <select
                value={simulatedIngredientId}
                onChange={(e) => setSimulatedIngredientId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} (Sekarang: {formatRupiah(ing.purchasePrice)}/{ing.purchaseQuantity}{ing.purchaseUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-stone-300 font-semibold">Simulasi Perubahan Harga:</label>
                <span className="font-bold text-amber-400">{priceChangePercent > 0 ? `+${priceChangePercent}%` : `${priceChangePercent}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={priceChangePercent}
                onChange={(e) => setPriceChangePercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex flex-col justify-center">
              <span className="text-stone-400 text-[11px]">Harga Baru {simIngredient?.name}:</span>
              <span className="text-amber-300 font-bold text-sm">
                {formatRupiah((simIngredient?.costPerUsageUnit || 0) * (1 + priceChangePercent / 100))}/{simIngredient?.usageUnit}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu atau resep..."
            className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat === 'All' ? 'Semua Menu' : cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs font-semibold text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="margin">Margin Tertinggi</option>
            <option value="hpp">HPP Tertinggi</option>
            <option value="price">Harga Jual Tertinggi</option>
            <option value="sales">Penjualan Terbanyak</option>
          </select>
        </div>

      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-12 text-center bg-stone-900/60 border border-dashed border-stone-800 rounded-3xl text-stone-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-stone-600 mb-3" />
          <p className="text-base font-semibold text-stone-300">Tidak ada resep yang sesuai.</p>
          <p className="text-xs text-stone-500 mt-1">Coba ubah kata kunci pencarian atau buat menu baru.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-amber-600 text-stone-950 rounded-xl text-xs font-bold"
          >
            + Buat Resep Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const margin = recipe.actualMarginPercent;
            const isGoodMargin = margin >= (recipe.targetMarginPercent || defaultTargetMargin);
            const isLowMargin = margin < 50;

            // Simulated HPP if simulator is active
            let simulatedHpp = recipe.totalHpp;
            if (simulatorOpen && simIngredient) {
              recipe.ingredients.forEach(item => {
                if (item.ingredientId === simIngredient.id) {
                  const newCost = item.amount * (simIngredient.costPerUsageUnit * (1 + priceChangePercent / 100));
                  simulatedHpp = simulatedHpp - item.cost + newCost;
                }
              });
            }
            const simMargin = recipe.sellingPrice > 0 ? ((recipe.sellingPrice - simulatedHpp) / recipe.sellingPrice) * 100 : 0;

            return (
              <div
                key={recipe.id}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                      {recipe.category}
                    </span>

                    {isOwner ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isLowMargin
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isGoodMargin
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        Margin {formatPercent(margin, 1)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {recipe.servingSize || '1 Porsi'}
                      </span>
                    )}
                  </div>

                  {/* Menu Name & Description */}
                  <h3 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {recipe.description || `${recipe.ingredients.length} komposisi bahan baku.`}
                  </p>

                  {/* Owner View: Key Pricing & Margin Box */}
                  {isOwner ? (
                    <div className="mt-4 p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400">Total HPP / Porsi:</span>
                        <span className="font-bold text-amber-400">{formatRupiah(recipe.totalHpp)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400">Harga Jual:</span>
                        <span className="font-bold text-stone-100">{formatRupiah(recipe.sellingPrice)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-stone-800/80 pt-1.5">
                        <span className="text-stone-400">Profit Bersih / Cup:</span>
                        <span className="font-bold text-emerald-400">{formatRupiah(recipe.profitNominal)}</span>
                      </div>

                      {/* Simulator info if active */}
                      {simulatorOpen && simulatedHpp !== recipe.totalHpp && (
                        <div className="pt-2 border-t border-dashed border-amber-900/60 text-[11px] text-amber-300 flex justify-between">
                          <span>HPP Simulasi: <strong>{formatRupiah(simulatedHpp)}</strong></span>
                          <span>Margin: <strong>{formatPercent(simMargin, 1)}</strong></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Barista View: SOP Takaran Bahan Box */
                    <div className="mt-4 p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/90 space-y-2">
                      <div className="flex justify-between items-center text-xs pb-1.5 border-b border-stone-800">
                        <span className="text-stone-400 font-medium">Harga Menu di Kasir:</span>
                        <span className="font-bold text-stone-100">{formatRupiah(recipe.sellingPrice)}</span>
                      </div>
                      
                      <div className="pt-1">
                        <p className="text-[11px] font-bold text-blue-400 mb-1.5 flex items-center gap-1">
                          <span>📋 Standar Takaran Racikan (BOM):</span>
                        </p>
                        <div className="space-y-1">
                          {recipe.ingredients.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-stone-900/90 px-2 py-1 rounded-lg border border-stone-800/60">
                              <span className="text-stone-300 truncate">{item.ingredientName}</span>
                              <span className="font-bold text-amber-400 shrink-0 ml-2">
                                {item.amount} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ingredients Preview (Owner Mode) */}
                  {isOwner && (
                    <div className="mt-3 text-[11px] text-stone-400">
                      <span className="font-semibold text-stone-300">Komposisi: </span>
                      {recipe.ingredients.map(i => `${i.ingredientName} (${i.amount}${i.unit})`).join(', ')}
                    </div>
                  )}

                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPrintingRecipe(recipe)}
                      className="px-2.5 py-1.5 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Lihat & Cetak Kartu SOP Resep"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isOwner ? 'Print SOP' : 'Lihat SOP Lengkap'}</span>
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => handleDuplicate(recipe)}
                        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Duplikat Resep"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => onDeleteRecipe(recipe.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                          title="Hapus Resep"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(recipe)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit Resep</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveRecipe}
        editingRecipe={editingRecipe}
        ingredients={ingredients}
        defaultTargetMargin={defaultTargetMargin}
      />

      {/* Print SOP Card Modal */}
      <RecipePrintCard
        recipe={printingRecipe}
        onClose={() => setPrintingRecipe(null)}
        cafeName={cafeName}
      />

    </div>
  );
};
