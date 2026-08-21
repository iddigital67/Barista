import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingDown, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Coffee,
  Lightbulb,
  Lock,
  DollarSign
} from 'lucide-react';
import { Ingredient, IngredientCategory, Recipe, UserRole } from '../../types';
import { formatRupiah, formatDateIndo, getDaysUntilExpiry } from '../../utils/formatters';
import { IngredientModal } from './IngredientModal';

interface IngredientListProps {
  ingredients: Ingredient[];
  recipes?: Recipe[];
  userRole?: UserRole;
  onOpenOwnerAuth?: () => void;
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (ingredientId: string) => void;
}

const CATEGORIES: ('All' | IngredientCategory)[] = [
  'All',
  'Kopi & Espresso',
  'Susu & Dairy',
  'Syrup & Sauce',
  'Powder & Teh',
  'Buah & Minuman',
  'Bakery & Pastry',
  'Kitchen & Protein',
  'Bumbu & Saus',
  'Packaging & Cup',
];

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  recipes = [],
  userRole = 'owner',
  onOpenOwnerAuth,
  onSaveIngredient,
  onDeleteIngredient,
}) => {
  const isOwner = userRole === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IngredientCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lowStock' | 'nearExpiry'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const filtered = ingredients.filter((ing) => {
    if (selectedCategory !== 'All' && ing.category !== selectedCategory) return false;
    
    if (statusFilter === 'lowStock' && ing.currentStock > ing.minStockAlert) return false;
    
    if (statusFilter === 'nearExpiry') {
      const days = getDaysUntilExpiry(ing.expiryDate);
      if (days === null || days > 14 || days < 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ing.name.toLowerCase().includes(q) ||
        (ing.supplier || '').toLowerCase().includes(q) ||
        (ing.notes || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingIngredient(ing);
    setIsModalOpen(true);
  };

  // Quick stock adjustment (+/- 10%)
  const handleQuickAdjust = (ing: Ingredient, delta: number) => {
    const newStock = Math.max(0, ing.currentStock + delta);
    onSaveIngredient({
      ...ing,
      currentStock: newStock,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Helper to get remaining portions based on recipes
  const getPortionAdvice = (ing: Ingredient) => {
    const usingRecipes = recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ing.id)
    );

    if (usingRecipes.length === 0) return null;

    const mainRecipe = usingRecipes.find(r => r.isPopular) || usingRecipes[0];
    const itemInRecipe = mainRecipe.ingredients.find(ri => ri.ingredientId === ing.id);

    if (!itemInRecipe || itemInRecipe.amount <= 0) return null;

    const remainingCups = Math.floor(ing.currentStock / itemInRecipe.amount);
    return {
      recipeName: mainRecipe.name,
      amountPerCup: itemInRecipe.amount,
      unit: itemInRecipe.unit,
      remainingCups,
      isLow: remainingCups <= 25 || ing.currentStock <= ing.minStockAlert
    };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-500" />
            <span>{isOwner ? 'Katalog Bahan Baku & Inventori Stok' : 'Inventori & Stok Fisik Barista'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            {isOwner 
              ? 'Kelola harga beli dari supplier, konversi satuan gramasi, dan pantau estimasi sisa porsi/gelas.'
              : 'Pantau sisa stok fisik di bar, estimasi porsi saji menu, dan lakukan update stok berkala.'}
          </p>
        </div>

        {isOwner ? (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Bahan Baku</span>
          </button>
        ) : (
          <button
            onClick={onOpenOwnerAuth}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5 transition-all self-start sm:self-auto"
            title="Perlu PIN Owner untuk tambah bahan baku"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Tambah Bahan (PIN)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bahan baku, kopi, susu, supplier..."
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
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat === 'All' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Ingredients */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-stone-900 border border-dashed border-stone-800 rounded-3xl text-stone-400">
          <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
          <p className="text-base font-semibold text-stone-200">Tidak ada bahan baku yang cocok.</p>
          <p className="text-xs text-stone-500 mt-1">Coba sesuaikan filter atau tambah bahan baru.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-amber-600 text-stone-950 rounded-xl text-xs font-bold"
          >
            + Tambah Bahan Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ing) => {
            const isLowStock = ing.currentStock <= ing.minStockAlert;
            const daysToExpiry = getDaysUntilExpiry(ing.expiryDate);
            const isExpiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 7;
            const isExpired = daysToExpiry !== null && daysToExpiry < 0;
            const portionAdvice = getPortionAdvice(ing);

            return (
              <div
                key={ing.id}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 p-4 rounded-2xl shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                      {ing.category}
                    </span>

                    {/* Stock Alert Badge */}
                    {isLowStock ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stok Menipis
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Stok Cukup
                      </span>
                    )}
                  </div>

                  {/* Name & Supplier */}
                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {ing.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {ing.supplier ? `Supplier: ${ing.supplier}` : 'Supplier Umum / Grosir'}
                  </p>

                  {/* SMART SUGGESTION: Sisa Gelas / Porsi Card */}
                  {portionAdvice && (
                    <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      portionAdvice.isLow
                        ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                        : 'bg-stone-950/40 border-stone-800 text-stone-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Coffee className={`w-4 h-4 shrink-0 ${portionAdvice.isLow ? 'text-amber-400' : 'text-stone-400'}`} />
                        <div className="leading-tight">
                          <span className="text-[11px] block font-medium">
                            Cukup untuk <strong className="text-amber-300 font-bold">~{portionAdvice.remainingCups} porsi</strong>
                          </span>
                          <span className="text-[10px] text-stone-400 truncate max-w-[140px] block">
                            Menu: {portionAdvice.recipeName}
                          </span>
                        </div>
                      </div>

                      {portionAdvice.isLow && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          Reorder Segera
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pricing and Unit Rate Card (Owner) vs Barista Usage Stats */}
                  {isOwner ? (
                    <div className="mt-2.5 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-300">
                        <span>Harga Beli:</span>
                        <strong className="text-stone-100">
                          {formatRupiah(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.purchaseUnit}
                        </strong>
                      </div>

                      <div className="flex justify-between text-amber-300 font-bold border-t border-stone-800/80 pt-1.5">
                        <span>Biaya / {ing.usageUnit}:</span>
                        <span>{formatRupiah(ing.costPerUsageUnit)} / {ing.usageUnit}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs flex items-center justify-between">
                      <span className="text-stone-400">Satuan Bar:</span>
                      <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {ing.usageUnit}
                      </span>
                    </div>
                  )}

                  {/* Stock Level Bar & Expiry */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Sisa Stok Fisik:</span>
                      <span className={`font-bold ${isLowStock ? 'text-rose-400' : 'text-stone-200'}`}>
                        {ing.currentStock} {ing.usageUnit}
                        <span className="text-[10px] text-stone-500 font-normal ml-1">
                          (Min: {ing.minStockAlert})
                        </span>
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-stone-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (ing.currentStock / (ing.minStockAlert * 3 || 1)) * 100))}%`
                        }}
                      />
                    </div>

                    {/* Expiry date tag */}
                    {ing.expiryDate && (
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-stone-400">Kadaluarsa:</span>
                        <span className={`font-semibold ${
                          isExpired 
                            ? 'text-red-400' 
                            : isExpiringSoon 
                            ? 'text-amber-400' 
                            : 'text-stone-300'
                        }`}>
                          {formatDateIndo(ing.expiryDate)} {isExpired ? '(EXP!)' : isExpiringSoon ? `(${daysToExpiry} hari lagi)` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  {/* Stock adjustment +/- for daily stock count */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-500 font-medium mr-1">Sesuaikan:</span>
                    <button
                      onClick={() => handleQuickAdjust(ing, -(ing.usageUnit === 'gr' || ing.usageUnit === 'ml' ? 100 : 1))}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                      title="Kurangi stok fisik"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(ing, (ing.usageUnit === 'gr' || ing.usageUnit === 'ml' ? 100 : 1))}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                      title="Tambah stok fisik"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => onDeleteIngredient(ing.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                          title="Hapus Bahan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(ing)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-medium">Stok Bar Shift</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Ingredient Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveIngredient}
        editingIngredient={editingIngredient}
      />

    </div>
  );
};
