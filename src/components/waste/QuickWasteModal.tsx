import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle, Sparkles, Coffee, User, Clock, AlertTriangle } from 'lucide-react';
import { WasteLog, Ingredient, WasteReason } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QuickWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wasteLog: WasteLog) => void;
  ingredients: Ingredient[];
  baristas: string[];
}

const WASTE_REASONS: { label: WasteReason; icon: string; desc: string }[] = [
  { label: 'Kadaluarsa / Basi', icon: '⏱️', desc: 'Bahan melewati tanggal exp / bau asam' },
  { label: 'Tumpah / Rusak di Bar', icon: '💥', desc: 'Tersenggol, jatuh, pecah, bocor' },
  { label: 'Salah Resep / Barista Error', icon: '❌', desc: 'Salah takaran, salah sirup, salah order' },
  { label: 'Over-extraction / Dial-in Kopi', icon: '☕', desc: 'Shot espresso under/over saat kalibrasi' },
  { label: 'Sisa Prep / Overprep Harian', icon: '🥣', desc: 'Sisa susu steam di pitcher / adonan sisa' },
  { label: 'Kualitas Bahan Buruk / Reject Supplier', icon: '📦', desc: 'Bahan rusak dari distributor' },
  { label: 'Uji Coba Resep / QC Training', icon: '🧪', desc: 'Latihan barista / inovasi menu' },
  { label: 'Lainnya', icon: '📝', desc: 'Alasan operasional lainnya' },
];

export const QuickWasteModal: React.FC<QuickWasteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ingredients,
  baristas,
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState(ingredients[0]?.id || '');
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState<WasteReason>('Sisa Prep / Overprep Harian');
  const [responsiblePerson, setResponsiblePerson] = useState(baristas[0] || 'Barista');
  const [shift, setShift] = useState<'Shift Pagi (Opening)' | 'Shift Siang (Peak)' | 'Shift Malam (Closing)'>('Shift Siang (Peak)');
  const [isPreventable, setIsPreventable] = useState(true);
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  useEffect(() => {
    if (isOpen && ingredients.length > 0) {
      if (!selectedIngredientId) {
        setSelectedIngredientId(ingredients[0].id);
      }
    }
  }, [isOpen, ingredients, selectedIngredientId]);

  if (!isOpen) return null;

  const currentIngredient = ingredients.find(i => i.id === selectedIngredientId) || ingredients[0];
  const unit = currentIngredient?.usageUnit || 'gr';
  const costLost = (amount || 0) * (currentIngredient?.costPerUsageUnit || 0);

  // Quick amount stepper buttons depending on unit
  const quickIncrements = unit === 'gr' 
    ? [10, 20, 50, 100, 250, 500] 
    : unit === 'ml'
    ? [50, 100, 200, 500, 1000]
    : [1, 2, 3, 5, 10];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIngredient || amount <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: WasteLog = {
      id: `wst-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      ingredientId: currentIngredient.id,
      ingredientName: currentIngredient.name,
      category: currentIngredient.category,
      amount: Number(amount),
      unit: currentIngredient.usageUnit,
      costLost,
      reason,
      responsiblePerson,
      shift,
      isPreventable,
      notes: notes.trim(),
      actionTaken: actionTaken.trim()
    };

    onSave(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Catat Waste Cepat (Food Spoilage)
              </h3>
              <p className="text-[11px] text-stone-400">
                Input sisa bahan, tumpah, atau kesalahan racik bar.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-stone-200">
          
          {/* Ingredient Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Pilih Bahan Baku Terbuang
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-medium text-sm focus:border-red-500 focus:outline-none"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.category}) - {formatRupiah(ing.costPerUsageUnit)}/{ing.usageUnit}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Quick Buttons */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300">
                Jumlah Bahan Terbuang:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-white font-bold text-base text-center focus:border-red-500 focus:outline-none"
                />
                <span className="text-sm font-semibold text-stone-400 w-8">{unit}</span>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-stone-500 font-semibold mr-1">Pilih Cepat:</span>
              {quickIncrements.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    amount === val
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  {val} {unit}
                </button>
              ))}
            </div>

            {/* Estimated Loss Indicator */}
            <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">Estimasi Kerugian Biaya:</span>
              <span className="text-base font-extrabold text-red-400">
                {formatRupiah(costLost)}
              </span>
            </div>
          </div>

          {/* Reason Selection with Icons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Alasan / Penyebab Waste
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {WASTE_REASONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setReason(r.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                    reason === r.label
                      ? 'bg-red-950/40 border-red-500/80 text-white shadow-sm'
                      : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{r.label}</p>
                    <p className="text-[10px] text-stone-400 truncate">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shift & Responsible Barista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400">
                Shift Operasional
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200"
              >
                <option value="Shift Pagi (Opening)">Shift Pagi (Opening)</option>
                <option value="Shift Siang (Peak)">Shift Siang (Peak)</option>
                <option value="Shift Malam (Closing)">Shift Malam (Closing)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400">
                Petugas / Barista
              </label>
              <select
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200"
              >
                {baristas.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preventable Toggle */}
          <div className="p-3 rounded-xl bg-stone-850 border border-stone-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-stone-200">
                Apakah waste ini seharusnya dapat dicegah?
              </p>
              <p className="text-[10px] text-stone-400">
                Untuk bahan evaluasi SOP dan training barista.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPreventable(!isPreventable)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isPreventable
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-700 text-stone-300'
              }`}
            >
              {isPreventable ? 'Ya, Bisa Dicegah' : 'Tidak (Alami)'}
            </button>
          </div>

          {/* Notes & Action Taken */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-400">
              Catatan & Tindakan Korektif (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kalibrasi grinder shot ke-4, sudah dicatat di SOP"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Log Waste ({formatRupiah(costLost)})</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
