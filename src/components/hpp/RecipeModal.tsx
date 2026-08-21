import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info, Coffee, Package, Check, Sparkles } from 'lucide-react';
import { Recipe, RecipeIngredient, Ingredient, MenuCategory } from '../../types';
import { formatRupiah, formatPercent } from '../../utils/formatters';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  editingRecipe?: Recipe | null;
  ingredients: Ingredient[];
  defaultTargetMargin: number;
}

const MENU_CATEGORIES: MenuCategory[] = [
  'Coffee (Hot/Iced)',
  'Non-Coffee & Milk Based',
  'Manual Brew & Tea',
  'Mocktail & Refreshment',
  'Pastry & Bakery',
  'Main Course & Meals',
  'Snacks & Finger Food',
];

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecipe,
  ingredients,
  defaultTargetMargin,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Coffee (Hot/Iced)');
  const [description, setDescription] = useState('');
  const [servingSize, setServingSize] = useState('1 Porsi / Cup');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(3);
  const [targetMarginPercent, setTargetMarginPercent] = useState(defaultTargetMargin || 65);
  const [sellingPrice, setSellingPrice] = useState(25000);
  const [estimatedSalesPerMonth, setEstimatedSalesPerMonth] = useState(300);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Init form
  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setCategory(editingRecipe.category);
      setDescription(editingRecipe.description || '');
      setServingSize(editingRecipe.servingSize || '1 Porsi / Cup');
      setPreparationTimeMinutes(editingRecipe.preparationTimeMinutes || 3);
      setTargetMarginPercent(editingRecipe.targetMarginPercent || defaultTargetMargin || 65);
      setSellingPrice(editingRecipe.sellingPrice || 0);
      setEstimatedSalesPerMonth(editingRecipe.estimatedSalesPerMonth || 200);
      setRecipeIngredients(editingRecipe.ingredients || []);
    } else {
      setName('');
      setCategory('Coffee (Hot/Iced)');
      setDescription('');
      setServingSize('1 Porsi (16 oz)');
      setPreparationTimeMinutes(3);
      setTargetMarginPercent(defaultTargetMargin || 65);
      setSellingPrice(28000);
      setEstimatedSalesPerMonth(300);
      
      // Default to cup + espresso for quick start
      const defaultCup = ingredients.find(i => i.category === 'Packaging & Cup');
      const defaultCoffee = ingredients.find(i => i.category === 'Kopi & Espresso');
      const initList: RecipeIngredient[] = [];
      if (defaultCoffee) {
        initList.push({
          ingredientId: defaultCoffee.id,
          ingredientName: defaultCoffee.name,
          amount: 18,
          unit: defaultCoffee.usageUnit,
          cost: 18 * defaultCoffee.costPerUsageUnit,
          isPackaging: false
        });
      }
      if (defaultCup) {
        initList.push({
          ingredientId: defaultCup.id,
          ingredientName: defaultCup.name,
          amount: 1,
          unit: defaultCup.usageUnit,
          cost: 1 * defaultCup.costPerUsageUnit,
          isPackaging: true
        });
      }
      setRecipeIngredients(initList);
    }
  }, [editingRecipe, isOpen, defaultTargetMargin, ingredients]);

  if (!isOpen) return null;

  // Recalculate total ingredients and packaging costs
  const totalIngredientsCost = recipeIngredients
    .filter(i => !i.isPackaging)
    .reduce((sum, i) => sum + i.cost, 0);

  const packagingCost = recipeIngredients
    .filter(i => i.isPackaging)
    .reduce((sum, i) => sum + i.cost, 0);

  const totalHpp = totalIngredientsCost + packagingCost;

  // Recommended selling price based on target margin: Price = HPP / (1 - Margin/100)
  const recommendedSellingPrice = totalHpp > 0 && targetMarginPercent < 100
    ? Math.ceil((totalHpp / (1 - (targetMarginPercent / 100))) / 1000) * 1000
    : 0;

  const actualMarginPercent = sellingPrice > 0
    ? ((sellingPrice - totalHpp) / sellingPrice) * 100
    : 0;

  const profitNominal = sellingPrice - totalHpp;

  // Add an ingredient row
  const handleAddIngredientRow = () => {
    const available = ingredients[0];
    if (!available) return;

    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: available.id,
        ingredientName: available.name,
        amount: available.category === 'Packaging & Cup' ? 1 : 10,
        unit: available.usageUnit,
        cost: (available.category === 'Packaging & Cup' ? 1 : 10) * available.costPerUsageUnit,
        isPackaging: available.category === 'Packaging & Cup'
      }
    ]);
  };

  // Update ingredient selection or amount
  const handleIngredientChange = (index: number, ingredientId: string) => {
    const found = ingredients.find(i => i.id === ingredientId);
    if (!found) return;

    const updated = [...recipeIngredients];
    const curr = updated[index];
    const isPack = found.category === 'Packaging & Cup';
    const amount = curr.amount || (isPack ? 1 : 10);

    updated[index] = {
      ...curr,
      ingredientId: found.id,
      ingredientName: found.name,
      unit: found.usageUnit,
      cost: amount * found.costPerUsageUnit,
      isPackaging: isPack
    };
    setRecipeIngredients(updated);
  };

  const handleAmountChange = (index: number, amountVal: number) => {
    const updated = [...recipeIngredients];
    const curr = updated[index];
    const found = ingredients.find(i => i.id === curr.ingredientId);
    const costPerUnit = found ? found.costPerUsageUnit : 0;

    updated[index] = {
      ...curr,
      amount: amountVal,
      cost: amountVal * costPerUnit
    };
    setRecipeIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRecipe: Recipe = {
      id: editingRecipe ? editingRecipe.id : `rec-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      ingredients: recipeIngredients,
      totalIngredientsCost,
      packagingCost,
      totalHpp,
      sellingPrice: Number(sellingPrice) || 0,
      recommendedSellingPrice,
      targetMarginPercent,
      actualMarginPercent,
      profitNominal,
      estimatedSalesPerMonth: Number(estimatedSalesPerMonth) || 0,
      status: 'Active',
      preparationTimeMinutes: Number(preparationTimeMinutes) || 3,
      servingSize: servingSize.trim() || '1 Porsi',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">
                {editingRecipe ? 'Edit Resep & Kalkulasi HPP' : 'Tambah Resep & Menu Baru'}
              </h3>
              <p className="text-xs text-stone-400">
                Hitung komposisi bahan, biaya kemasan, dan kalkulasi margin keuntungan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-stone-200">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Nama Menu <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Iced Hazelnut Oat Latte"
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Kategori Menu
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
              >
                {MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Porsi / Serving Size
              </label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="Contoh: 16 oz (Cup)"
                className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Waktu Prep (Menit)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Est. Penjualan / Bulan
              </label>
              <input
                type="number"
                min="0"
                value={estimatedSalesPerMonth}
                onChange={(e) => setEstimatedSalesPerMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Deskripsi Singkat / SOP Racikan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Single espresso + 120ml steamed milk + 20ml syrup..."
              className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-sm resize-none"
            />
          </div>

          {/* Recipe Ingredients Bill of Materials (BOM) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Komposisi Bahan & Packaging (Bill of Materials)</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Biaya dihitung otomatis per gram/ml/pcs dari database harga bahan baku.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            {recipeIngredients.length === 0 ? (
              <div className="p-6 text-center bg-stone-950/40 border border-dashed border-stone-800 rounded-2xl">
                <p className="text-sm text-stone-400">Belum ada bahan baku ditambahkan.</p>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="mt-2 text-xs text-amber-400 hover:underline"
                >
                  + Tambahkan bahan pertama
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recipeIngredients.map((item, idx) => {
                  const currentIng = ingredients.find(i => i.id === item.ingredientId);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        item.isPackaging
                          ? 'bg-amber-950/20 border-amber-800/30'
                          : 'bg-stone-950/50 border-stone-800'
                      }`}
                    >
                      {/* Ingredient selector */}
                      <div className="flex-1 min-w-[200px] w-full sm:w-auto">
                        <select
                          value={item.ingredientId}
                          onChange={(e) => handleIngredientChange(idx, e.target.value)}
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs font-semibold text-stone-100 focus:outline-none focus:border-amber-500"
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.category === 'Packaging & Cup' ? '📦 ' : '☕ '}
                              {ing.name} ({formatRupiah(ing.costPerUsageUnit)}/{ing.usageUnit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Amount & Unit input */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.amount}
                            onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                            className="w-20 px-2.5 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400 font-medium w-8">
                            {item.unit}
                          </span>
                        </div>

                        {/* Calculated Subtotal Cost */}
                        <div className="w-24 text-right">
                          <p className="text-xs font-bold text-amber-300">
                            {formatRupiah(item.cost)}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {item.isPackaging ? 'Packaging' : 'Bahan'}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick summary of BOM */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-800/60 rounded-xl text-xs text-stone-300 border border-stone-700/60">
              <div className="flex gap-4">
                <span>Biaya Bahan: <strong className="text-stone-100">{formatRupiah(totalIngredientsCost)}</strong></span>
                <span>Kemasan: <strong className="text-stone-100">{formatRupiah(packagingCost)}</strong></span>
              </div>
              <div className="text-sm font-bold text-amber-400">
                Total HPP: {formatRupiah(totalHpp)}
              </div>
            </div>
          </div>

          {/* Pricing & Profit Margin Calculation Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 border border-amber-900/40 space-y-4">
            
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Simulasi Penetapan Harga & Target Margin</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Target Margin Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-300">Target Margin:</span>
                  <span className="font-bold text-amber-400">{targetMarginPercent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  step="1"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400">Standar Cafe: 60% - 75%</p>
              </div>

              {/* Recommended Selling Price */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <p className="text-[11px] text-stone-400 uppercase font-semibold">Harga Rekomendasi</p>
                <p className="text-lg font-bold text-amber-300">{formatRupiah(recommendedSellingPrice)}</p>
                <button
                  type="button"
                  onClick={() => setSellingPrice(recommendedSellingPrice)}
                  className="text-[10px] text-amber-400 hover:underline font-semibold"
                >
                  Terapkan Harga Ini
                </button>
              </div>

              {/* Actual Selling Price Input */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <label className="text-[11px] text-stone-400 uppercase font-semibold block">
                  Harga Jual Aktual (Rp)
                </label>
                <input
                  type="number"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-stone-800 border border-stone-700 rounded-lg text-white font-bold text-base focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Margin & Profit Result */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <p className="text-[11px] text-stone-400 uppercase font-semibold">Margin Aktual & Profit</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-bold ${
                    actualMarginPercent >= targetMarginPercent ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatPercent(actualMarginPercent, 1)}
                  </span>
                  <span className="text-xs text-stone-400 font-semibold">
                    ({formatRupiah(profitNominal)})
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">
                  {actualMarginPercent >= targetMarginPercent ? '✅ Target tercapai' : '⚠️ Di bawah target'}
                </p>
              </div>

            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-sm font-bold shadow-lg shadow-amber-950 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Resep & HPP</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
