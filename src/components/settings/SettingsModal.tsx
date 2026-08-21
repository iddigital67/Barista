import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Check, 
  Plus, 
  Trash2, 
  Store, 
  Users, 
  DollarSign, 
  KeyRound, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';
import { CafeSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CafeSettings;
  onSaveSettings: (settings: CafeSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [cafeName, setCafeName] = useState(settings.cafeName);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [defaultTargetMargin, setDefaultTargetMargin] = useState(settings.defaultTargetMargin || 65);
  const [maxWasteTolerancePercent, setMaxWasteTolerancePercent] = useState(settings.maxWasteTolerancePercent || 3);
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState(settings.monthlyRevenueTarget || 50000000);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState(settings.monthlyFixedCost || 15000000);
  const [baristas, setBaristas] = useState<string[]>(settings.baristas || []);
  const [ownerPin, setOwnerPin] = useState(settings.ownerPin || '1234');
  const [baristaPins, setBaristaPins] = useState<Record<string, string>>(settings.baristaPins || {});
  
  const [newBaristaName, setNewBaristaName] = useState('');
  const [newBaristaPin, setNewBaristaPin] = useState('');

  if (!isOpen) return null;

  const handleAddBarista = () => {
    if (!newBaristaName.trim()) return;
    const name = newBaristaName.trim();
    if (!baristas.includes(name)) {
      setBaristas([...baristas, name]);
      setBaristaPins(prev => ({
        ...prev,
        [name]: newBaristaPin.trim() || '1234'
      }));
    }
    setNewBaristaName('');
    setNewBaristaPin('');
  };

  const handleRemoveBarista = (nameToRemove: string) => {
    setBaristas(baristas.filter((b) => b !== nameToRemove));
    setBaristaPins(prev => {
      const updated = { ...prev };
      delete updated[nameToRemove];
      return updated;
    });
  };

  const handleUpdateBaristaPin = (name: string, pin: string) => {
    setBaristaPins(prev => ({
      ...prev,
      [name]: pin.replace(/\D/g, '').slice(0, 6)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      cafeName: cafeName.trim() || 'Cafe Kita',
      tagline: tagline.trim(),
      currency: 'IDR',
      defaultTargetMargin: Number(defaultTargetMargin) || 65,
      maxWasteTolerancePercent: Number(maxWasteTolerancePercent) || 3,
      monthlyRevenueTarget: Number(monthlyRevenueTarget) || 0,
      monthlyFixedCost: Number(monthlyFixedCost) || 0,
      baristas: baristas.length > 0 ? baristas : ['Barista 1'],
      ownerPin: ownerPin.trim() || '1234',
      baristaPins: baristaPins
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Pengaturan Cafe, Finansial & PIN User
              </h3>
              <p className="text-[11px] text-stone-400">
                Sesuaikan nama cafe, toleransi waste %, PIN Owner, dan PIN masing-masing Barista.
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-stone-200 text-xs">
          
          {/* Cafe Profile */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>Profil Bisnis</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Nama Coffee Shop / Resto</label>
                <input
                  type="text"
                  required
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Tagline / Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Security & PIN Settings for Owner & Baristas */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Keamanan & PIN Masing-Masing User</span>
              </h4>
              <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full border border-stone-700">
                4-6 Digit Angka
              </span>
            </div>

            {/* Owner PIN Setting */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">PIN Owner / Manajemen</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-400">Proteksi HPP & Laporan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-stone-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono tracking-widest text-sm focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <span className="text-[11px] text-stone-400">
                  PIN untuk membuka mode Owner dan laporan finansial.
                </span>
              </div>
            </div>

            {/* Individual Barista PINs */}
            <div className="space-y-2 pt-1">
              <label className="text-stone-300 font-semibold block">
                PIN Khusus Masing-Masing Barista:
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {baristas.map((name, idx) => {
                  const currentBaristaPin = baristaPins[name] || '1234';
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {name.charAt(0)}
                        </div>
                        <span className="font-semibold text-stone-200 truncate">{name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-stone-400">PIN:</span>
                        <input
                          type="text"
                          maxLength={6}
                          value={currentBaristaPin}
                          onChange={(e) => handleUpdateBaristaPin(name, e.target.value)}
                          placeholder="PIN"
                          className="w-20 px-2 py-1 bg-stone-900 border border-stone-600 rounded-lg text-center text-stone-100 font-mono tracking-wider text-xs focus:outline-none focus:border-blue-400 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBarista(name)}
                          className="p-1 text-stone-500 hover:text-rose-400 rounded transition-colors"
                          title="Hapus Barista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Barista Form with PIN */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBaristaName}
                    onChange={(e) => setNewBaristaName(e.target.value)}
                    placeholder="Tambah nama barista / kitchen baru..."
                    className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={newBaristaPin}
                    onChange={(e) => setNewBaristaPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN (opsional)"
                    className="w-28 px-2.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-center text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBarista}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl whitespace-nowrap active:scale-95 transition-all"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Financial Targets */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Target Margin & Toleransi Waste</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Default Target Margin (% Laba Kotor)</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={defaultTargetMargin}
                  onChange={(e) => setDefaultTargetMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                />
                <p className="text-[10px] text-stone-500">Standar industri F&B: 65% - 70%</p>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Batas Toleransi Maksimal Waste (% dari HPP)</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={maxWasteTolerancePercent}
                  onChange={(e) => setMaxWasteTolerancePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                />
                <p className="text-[10px] text-stone-500">Batas ideal F&B: 2.0% - 3.0%</p>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Target Omset Bulanan (Rp)</label>
                <input
                  type="number"
                  value={monthlyRevenueTarget}
                  onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-semibold">Biaya Operasional Tetap / Bln (Sewa & Gaji)</label>
                <input
                  type="number"
                  value={monthlyFixedCost}
                  onChange={(e) => setMonthlyFixedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3 sticky bottom-0 bg-stone-900 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-950 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
