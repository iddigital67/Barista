import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  TrendingDown, 
  AlertCircle, 
  Sparkles, 
  BarChart2, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { WasteLog, Ingredient, WasteReason, IngredientCategory } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../../utils/formatters';
import { WasteInsights } from './WasteInsights';
import { storageService } from '../../services/storageService';

interface WasteTrackerProps {
  wasteLogs: WasteLog[];
  ingredients: Ingredient[];
  onAddWaste: (log: WasteLog) => void;
  onDeleteWaste: (logId: string) => void;
  onOpenQuickWaste: () => void;
}

export const WasteTracker: React.FC<WasteTrackerProps> = ({
  wasteLogs,
  ingredients,
  onAddWaste,
  onDeleteWaste,
  onOpenQuickWaste,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'analytics' | 'insights'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'thisMonth'>('thisMonth');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter logs
  const filteredLogs = wasteLogs.filter(w => {
    // Date filter
    if (dateFilter === 'today' && w.date !== todayStr) return false;
    if (dateFilter === 'thisMonth' && (!w.date || !w.date.startsWith(currentMonthStr))) return false;
    if (dateFilter === '7days') {
      const logDate = new Date(w.date).getTime();
      const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
      if (logDate < sevenDaysAgo) return false;
    }

    // Reason & Category
    if (selectedReason !== 'All' && w.reason !== selectedReason) return false;
    if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.ingredientName.toLowerCase().includes(q) ||
        w.responsiblePerson.toLowerCase().includes(q) ||
        w.reason.toLowerCase().includes(q) ||
        (w.notes || '').toLowerCase().includes(q)
      );
    }

    return true;
  }).sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());

  // Calculations for filtered logs
  const totalFilteredCost = filteredLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const totalFilteredItems = filteredLogs.length;

  const handleExportCsv = () => {
    const csvContent = storageService.exportWasteCsv(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Waste_Log_Cafe_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-rose-500" />
            <span>Pencatatan & Analisa Waste Bahan Baku</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Lacak kerugian bahan basi, tumpah, overprep, dan sisa racikan barista harian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenQuickWaste}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Waste Baru</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Riwayat Log Waste ({wasteLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Analisa & Pareto
        </button>

        <button
          onClick={() => setActiveSubTab('insights')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'insights'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOP & Rekomendasi</span>
        </button>
      </div>

      {/* Content depending on tab */}
      {activeSubTab === 'insights' ? (
        <WasteInsights wasteLogs={wasteLogs} ingredients={ingredients} />
      ) : activeSubTab === 'analytics' ? (
        <div className="space-y-6">
          <WasteInsights wasteLogs={wasteLogs} ingredients={ingredients} />
        </div>
      ) : (
        /* Logs Tab */
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari bahan, barista, atau catatan..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/80 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    dateFilter === 'today' ? 'bg-rose-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setDateFilter('7days')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    dateFilter === '7days' ? 'bg-rose-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  7 Hari Terakhir
                </button>
                <button
                  onClick={() => setDateFilter('thisMonth')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    dateFilter === 'thisMonth' ? 'bg-rose-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    dateFilter === 'all' ? 'bg-rose-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Semua
                </button>
              </div>

            </div>

            {/* Sub Filter: Category and Reason */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-medium">Alasan:</span>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="px-2.5 py-1 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 text-xs"
                >
                  <option value="All">Semua Alasan</option>
                  <option value="Kadaluarsa / Basi">Kadaluarsa / Basi</option>
                  <option value="Tumpah / Rusak di Bar">Tumpah / Rusak</option>
                  <option value="Salah Resep / Barista Error">Salah Resep</option>
                  <option value="Over-extraction / Dial-in Kopi">Dial-in Kopi</option>
                  <option value="Sisa Prep / Overprep Harian">Sisa Overprep</option>
                  <option value="Kualitas Bahan Buruk / Reject Supplier">Reject Supplier</option>
                  <option value="Uji Coba Resep / QC Training">Uji Coba / QC</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-medium">Kategori:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 text-xs"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Kopi & Espresso">Kopi & Espresso</option>
                  <option value="Susu & Dairy">Susu & Dairy</option>
                  <option value="Syrup & Sauce">Syrup & Sauce</option>
                  <option value="Powder & Teh">Powder & Teh</option>
                  <option value="Bakery & Pastry">Bakery & Pastry</option>
                  <option value="Kitchen & Protein">Kitchen & Protein</option>
                  <option value="Packaging & Cup">Packaging & Cup</option>
                </select>
              </div>

              <div className="ml-auto text-stone-300 font-semibold self-center">
                Total Kerugian Terfilter: <strong className="text-rose-400 font-bold">{formatRupiah(totalFilteredCost)}</strong> ({totalFilteredItems} catatan)
              </div>
            </div>

          </div>

          {/* Waste Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-stone-900 border border-dashed border-stone-800 rounded-3xl text-stone-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/60 mb-3" />
              <p className="text-base font-semibold text-stone-200">Tidak ada catatan waste ditemukan.</p>
              <p className="text-xs text-stone-500 mt-1">Gunakan filter lain atau catat waste baru bila ada bahan terbuang.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  
                  {/* Left: Info */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-100 text-sm">{log.ingredientName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {log.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {log.reason}
                      </span>
                      {log.isPreventable ? (
                        <span className="text-[10px] font-medium text-amber-400">
                          (Dapat dicegah)
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-400 flex-wrap">
                      <span className="flex items-center gap-1 text-stone-300">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        {formatDateIndo(log.date)} • {log.time || '12:00'} ({log.shift})
                      </span>
                      <span className="flex items-center gap-1 text-stone-300">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        {log.responsiblePerson}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-stone-400 italic bg-stone-950/40 p-1.5 rounded-lg border border-stone-800/80">
                        "{log.notes}" {log.actionTaken ? `• Tindakan: ${log.actionTaken}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Right: Quantity & Loss Nominal */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-stone-200">
                        {log.amount} {log.unit}
                      </p>
                      <p className="text-xs font-extrabold text-rose-400">
                        - {formatRupiah(log.costLost)}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteWaste(log.id)}
                      className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
