import React, { useState, useEffect } from 'react';
import { X, Package, Check, Calculator, Info } from 'lucide-react';
import { Ingredient, IngredientCategory, UnitType } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  editingIngredient?: Ingredient | null;
}

const INGREDIENT_CATEGORIES: IngredientCategory[] = [
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

const UNIT_OPTIONS: UnitType[] = ['gr', 'kg', 'ml', 'liter', 'pcs', 'pack', 'slice', 'can', 'portion'];

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIngredient,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Kopi & Espresso');
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>('kg');
  const [purchasePrice, setPurchasePrice] = useState<number>(150000);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [usageUnit, setUsageUnit] = useState<UnitType>('gr');
  const [conversionRate, setConversionRate] = useState<number>(1000);
  const [currentStock, setCurrentStock] = useState<number>(2000);
  const [minStockAlert, setMinStockAlert] = useState<number>(500);
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingIngredient) {
      setName(editingIngredient.name);
      setCategory(editingIngredient.category);
      setPurchaseUnit(editingIngredient.purchaseUnit);
      setPurchasePrice(editingIngredient.purchasePrice);
      setPurchaseQuantity(editingIngredient.purchaseQuantity || 1);
      setUsageUnit(editingIngredient.usageUnit);
      setConversionRate(editingIngredient.conversionRate || 1000);
      setCurrentStock(editingIngredient.currentStock);
      setMinStockAlert(editingIngredient.minStockAlert);
      setSupplier(editingIngredient.supplier || '');
      setExpiryDate(editingIngredient.expiryDate || '');
      setNotes(editingIngredient.notes || '');
    } else {
      setName('');
      setCategory('Kopi & Espresso');
      setPurchaseUnit('kg');
      setPurchasePrice(180000);
      setPurchaseQuantity(1);
      setUsageUnit('gr');
      setConversionRate(1000);
      setCurrentStock(2000);
      setMinStockAlert(500);
      setSupplier('');
      setExpiryDate('');
      setNotes('');
    }
  }, [editingIngredient, isOpen]);

  if (!isOpen) return null;

  // Auto set recommended conversion when purchase unit & usage unit changes
  const handlePurchaseUnitChange = (pUnit: UnitType) => {
    setPurchaseUnit(pUnit);
    if (pUnit === 'kg' && usageUnit !== 'gr') {
      setUsageUnit('gr');
      setConversionRate(1000);
    } else if (pUnit === 'liter' && usageUnit !== 'ml') {
      setUsageUnit('ml');
      setConversionRate(1000);
    } else if (pUnit === 'pack') {
      setUsageUnit('pcs');
      setConversionRate(1);
    }
  };

  const costPerUsageUnit = (purchaseQuantity * conversionRate) > 0
    ? purchasePrice / (purchaseQuantity * conversionRate)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newIng: Ingredient = {
      id: editingIngredient ? editingIngredient.id : `ing-${Date.now()}`,
      name: name.trim(),
      category,
      purchaseUnit,
      purchasePrice: Number(purchasePrice),
      purchaseQuantity: Number(purchaseQuantity) || 1,
      usageUnit,
      conversionRate: Number(conversionRate) || 1,
      currentStock: Number(currentStock) || 0,
      minStockAlert: Number(minStockAlert) || 0,
      costPerUsageUnit,
      supplier: supplier.trim(),
      expiryDate: expiryDate || '',
      notes: notes.trim(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(newIng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                {editingIngredient ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku & Kemasan'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Konversi otomatis harga pembelian ke biaya per porsi racikan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-stone-200">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Nama Bahan Baku / Item <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Fresh Milk Pasteurisasi (Greenfields)"
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              >
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Supplier / Toko Pembelian
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Contoh: Distributor Dairy Jaya"
                className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>
          </div>

          {/* Pricing & Unit Conversion Section */}
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-amber-900/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Kalkulasi Harga Beli & Konversi Satuan Pakai</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-stone-400 font-semibold">Harga Beli Total (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-400 font-semibold">Qty & Satuan Beli</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                    className="w-16 px-2 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-center text-sm"
                  />
                  <select
                    value={purchaseUnit}
                    onChange={(e) => handlePurchaseUnitChange(e.target.value as UnitType)}
                    className="flex-1 px-2 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-400 font-semibold">Satuan Pakai di Resep</label>
                <div className="flex gap-2">
                  <select
                    value={usageUnit}
                    onChange={(e) => setUsageUnit(e.target.value as UnitType)}
                    className="flex-1 px-2 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Conversion multiplier explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-900 rounded-xl text-xs border border-stone-800">
              <div className="text-stone-300">
                1 {purchaseUnit} = 
                <input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-16 mx-1 px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-center text-amber-300 font-bold"
                />
                {usageUnit}
              </div>

              <div className="text-right">
                <span className="text-stone-400">Biaya Modal per {usageUnit}: </span>
                <strong className="text-amber-400 text-sm font-bold">
                  {formatRupiah(costPerUsageUnit)} / {usageUnit}
                </strong>
              </div>
            </div>

          </div>

          {/* Stock & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-stone-300 font-semibold">
                Stok Saat Ini ({usageUnit})
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-stone-300 font-semibold">
                Peringatan Stok Min ({usageUnit})
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-stone-300 font-semibold">
                Tanggal Kadaluarsa (Exp)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs text-stone-400 font-semibold">Catatan Penyimpanan / Supplier</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Simpan di chiller suhu 2-4C, jangan kena sinar matahari"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-950 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Bahan Baku</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
