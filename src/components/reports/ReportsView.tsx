import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Coffee, 
  Sparkles, 
  CheckCircle, 
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Recipe, Ingredient, WasteLog, CafeSettings } from '../../types';
import { formatRupiah, formatPercent, formatNumber, formatDateIndo } from '../../utils/formatters';
import { storageService } from '../../services/storageService';

interface ReportsViewProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  recipes,
  ingredients,
  wasteLogs,
  settings,
}) => {
  const [reportType, setReportType] = useState<'matrix' | 'financial' | 'printableForm'>('matrix');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const monthLogs = wasteLogs.filter(w => w.date && w.date.startsWith(currentMonthStr));
  const monthWasteCost = monthLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);

  // Financial calculations
  const totalMonthlyEstRevenue = recipes.reduce((sum, r) => sum + (r.sellingPrice * (r.estimatedSalesPerMonth || 0)), 0);
  const totalMonthlyEstHpp = recipes.reduce((sum, r) => sum + (r.totalHpp * (r.estimatedSalesPerMonth || 0)), 0);
  const grossProfit = totalMonthlyEstRevenue - totalMonthlyEstHpp;
  const netEstimatedProfit = grossProfit - settings.monthlyFixedCost - monthWasteCost;

  // Menu Engineering Matrix Classification:
  // Avg margin threshold and Avg sales volume threshold
  const activeRecipes = recipes.filter(r => r.status === 'Active');
  const avgMargin = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + r.actualMarginPercent, 0) / activeRecipes.length
    : 65;
  const avgSales = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + (r.estimatedSalesPerMonth || 0), 0) / activeRecipes.length
    : 200;

  const stars = activeRecipes.filter(r => r.actualMarginPercent >= avgMargin && (r.estimatedSalesPerMonth || 0) >= avgSales);
  const workhorses = activeRecipes.filter(r => r.actualMarginPercent < avgMargin && (r.estimatedSalesPerMonth || 0) >= avgSales);
  const puzzles = activeRecipes.filter(r => r.actualMarginPercent >= avgMargin && (r.estimatedSalesPerMonth || 0) < avgSales);
  const dogs = activeRecipes.filter(r => r.actualMarginPercent < avgMargin && (r.estimatedSalesPerMonth || 0) < avgSales);

  const handlePrint = () => {
    window.print();
  };

  const handleExportHppCsv = () => {
    const csvContent = storageService.exportHppCsv(recipes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Menu_HPP_Summary_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Laporan & Menu Engineering Cafe</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Analisis matriks profitabilitas menu, ringkasan P&L estimasi, dan cetak form log waste untuk bar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHppCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Rekap HPP</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher (Print hidden) */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3 print:hidden">
        <button
          onClick={() => setReportType('matrix')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            reportType === 'matrix'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Matriks Menu Engineering (Stars & Dogs)
        </button>

        <button
          onClick={() => setReportType('financial')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            reportType === 'financial'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Ringkasan Keuangan & Waste
        </button>

        <button
          onClick={() => setReportType('printableForm')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            reportType === 'printableForm'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Form Fisik Log Waste Bar (Siap Cetak)
        </button>
      </div>

      {/* TAB 1: MENU ENGINEERING MATRIX */}
      {reportType === 'matrix' && (
        <div className="space-y-6">
          
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-xs text-stone-300 flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-300">
                Prinsip Menu Engineering (Boston Consulting Group Model untuk Resto & Cafe):
              </p>
              <p className="text-stone-400 mt-0.5">
                Mengelompokkan menu berdasarkan <span className="text-stone-200">Volume Penjualan</span> (Rata-rata: {Math.round(avgSales)} porsi/bln) dan <span className="text-stone-200">Margin Keuntungan</span> (Rata-rata: {formatPercent(avgMargin, 1)}).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* STARS: High Margin, High Volume */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 to-stone-900 border border-amber-600/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <h3 className="font-bold text-amber-300 text-sm">STARS (Bintang Utama)</h3>
                    <p className="text-[10px] text-stone-400">Margin Tinggi • Penjualan Tinggi</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {stars.length} Menu
                </span>
              </div>

              <p className="text-xs text-stone-300">
                <strong>Strategi:</strong> Pertahankan konsistensi rasa dan SOP secara ketat. Jangan ubah racikan!
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                {stars.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">Belum ada menu di kuadran ini.</p>
                ) : (
                  stars.map(m => (
                    <div key={m.id} className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex justify-between text-xs">
                      <span className="font-semibold text-stone-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-stone-400 ml-2">({m.estimatedSalesPerMonth} cup/bln)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PLOWHORSES: Low Margin, High Volume */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/40 to-stone-900 border border-blue-600/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐎</span>
                  <div>
                    <h3 className="font-bold text-blue-300 text-sm">PLOWHORSES (Kuda Penarik)</h3>
                    <p className="text-[10px] text-stone-400">Margin Rendah • Penjualan Sangat Ramai</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  {workhorses.length} Menu
                </span>
              </div>

              <p className="text-xs text-stone-300">
                <strong>Strategi:</strong> Naikkan harga jual bertahap (Rp 1.000 - 2.000) atau renegosiasi harga supplier bahan baku.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                {workhorses.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">Tidak ada menu di kategori ini.</p>
                ) : (
                  workhorses.map(m => (
                    <div key={m.id} className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex justify-between text-xs">
                      <span className="font-semibold text-stone-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-blue-400 font-bold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-stone-400 ml-2">({m.estimatedSalesPerMonth} cup/bln)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PUZZLES: High Margin, Low Volume */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 to-stone-900 border border-purple-600/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧩</span>
                  <div>
                    <h3 className="font-bold text-purple-300 text-sm">PUZZLES (Teka-Teki Menguntungkan)</h3>
                    <p className="text-[10px] text-stone-400">Margin Sangat Tinggi • Penjualan Masih Sedikit</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {puzzles.length} Menu
                </span>
              </div>

              <p className="text-xs text-stone-300">
                <strong>Strategi:</strong> Lakukan promo bundling (combo), taruh di posisi paling atas daftar menu POS, atau foto visual menarik.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                {puzzles.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">Tidak ada menu di kategori ini.</p>
                ) : (
                  puzzles.map(m => (
                    <div key={m.id} className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex justify-between text-xs">
                      <span className="font-semibold text-stone-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-purple-400 font-bold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-stone-400 ml-2">({m.estimatedSalesPerMonth} cup/bln)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DOGS: Low Margin, Low Volume */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 to-stone-900 border border-rose-600/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐕</span>
                  <div>
                    <h3 className="font-bold text-rose-300 text-sm">DOGS (Menu Kurang Produktif)</h3>
                    <p className="text-[10px] text-stone-400">Margin Rendah • Penjualan Rendah</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {dogs.length} Menu
                </span>
              </div>

              <p className="text-xs text-stone-300">
                <strong>Strategi:</strong> Evaluasi hapus dari menu untuk mengurangi kompleksitas inventori & potensi bahan expired.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                {dogs.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">Hebat! Tidak ada menu yang masuk kategori Dogs.</p>
                ) : (
                  dogs.map(m => (
                    <div key={m.id} className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex justify-between text-xs">
                      <span className="font-semibold text-stone-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-rose-400 font-bold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-stone-400 ml-2">({m.estimatedSalesPerMonth} cup/bln)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FINANCIAL SUMMARY */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <p className="text-xs font-semibold text-stone-400 uppercase">Potensi Omset Bulanan</p>
              <p className="text-2xl font-bold text-stone-100">{formatRupiah(totalMonthlyEstRevenue)}</p>
              <p className="text-[11px] text-stone-500">Berdasarkan estimasi penjualan</p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <p className="text-xs font-semibold text-stone-400 uppercase">Total Estimasi HPP</p>
              <p className="text-2xl font-bold text-amber-400">{formatRupiah(totalMonthlyEstHpp)}</p>
              <p className="text-[11px] text-stone-500">
                {totalMonthlyEstRevenue > 0 ? formatPercent((totalMonthlyEstHpp / totalMonthlyEstRevenue) * 100, 1) : '0%'} dari omset
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <p className="text-xs font-semibold text-stone-400 uppercase">Kerugian Waste Bulan Ini</p>
              <p className="text-2xl font-bold text-rose-400">- {formatRupiah(monthWasteCost)}</p>
              <p className="text-[11px] text-stone-500">{monthLogs.length} catatan log waste</p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <p className="text-xs font-semibold text-stone-400 uppercase">Est. Laba Bersih Operasional</p>
              <p className="text-2xl font-bold text-emerald-400">{formatRupiah(netEstimatedProfit)}</p>
              <p className="text-[11px] text-stone-500">Setelah Fixed Cost ({formatRupiah(settings.monthlyFixedCost)})</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE PHYSICAL LOG WASTE FORM */}
      {reportType === 'printableForm' && (
        <div className="bg-white text-stone-900 p-8 rounded-3xl shadow-xl max-w-4xl mx-auto font-sans">
          
          <div className="border-b-2 border-stone-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase text-stone-900">
                FORMULIR PENCATATAN WASTE & BAHAN RUSAK (DAILY WASTE LOG)
              </h2>
              <p className="text-xs text-stone-600 font-semibold">{settings.cafeName} • Bar & Kitchen Station</p>
            </div>
            <div className="text-right text-xs">
              <p>Tanggal: ___________________</p>
              <p className="mt-1">Shift: [ ] Pagi [ ] Siang [ ] Malam</p>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 mb-3 italic">
            *Setiap bahan basi, tumpah, overprep susu, atau gagal ekstraksi wajib dicatat sebelum dibuang ke tempat sampah.
          </p>

          <table className="w-full text-xs border-collapse border border-stone-400 text-left">
            <thead>
              <tr className="bg-stone-200 text-stone-800">
                <th className="border border-stone-400 p-2 text-center w-8">No</th>
                <th className="border border-stone-400 p-2">Jam</th>
                <th className="border border-stone-400 p-2">Nama Bahan Baku</th>
                <th className="border border-stone-400 p-2 text-center">Jumlah (gr/ml/pcs)</th>
                <th className="border border-stone-400 p-2">Alasan (Basi / Tumpah / Salah Racik / dll)</th>
                <th className="border border-stone-400 p-2">Nama Barista / Chef</th>
                <th className="border border-stone-400 p-2">Paraf</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i} className="h-9">
                  <td className="border border-stone-400 text-center font-medium">{i + 1}</td>
                  <td className="border border-stone-400"></td>
                  <td className="border border-stone-400"></td>
                  <td className="border border-stone-400"></td>
                  <td className="border border-stone-400"></td>
                  <td className="border border-stone-400"></td>
                  <td className="border border-stone-400"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 mt-8 text-xs text-center">
            <div>
              <p className="font-bold">Diserahkan oleh (Closing Barista):</p>
              <div className="h-16"></div>
              <p>( _______________________ )</p>
            </div>
            <div>
              <p className="font-bold">Diperiksa & Diinput ke Sistem oleh (Manager/Owner):</p>
              <div className="h-16"></div>
              <p>( _______________________ )</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
