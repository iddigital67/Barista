import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  HelpCircle, 
  Sparkles,
  Download,
  FileJson,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleSheetsConfig, Ingredient, Recipe, WasteLog, CafeSettings } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/appsScriptTemplate';
import { storageService } from '../../services/storageService';

interface GoogleSheetsSyncProps {
  sheetsConfig: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  onDataImported: (data: {
    ingredients?: Ingredient[];
    recipes?: Recipe[];
    wasteLogs?: WasteLog[];
    settings?: CafeSettings;
  }) => void;
  onResetData: () => void;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  sheetsConfig,
  onSaveConfig,
  ingredients,
  recipes,
  wasteLogs,
  settings,
  onDataImported,
  onResetData,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(sheetsConfig.webAppUrl || '');
  const [sheetUrl, setSheetUrl] = useState(sheetsConfig.sheetUrl || '');
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync || false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveConfig = () => {
    const updated: GoogleSheetsConfig = {
      sheetUrl: sheetUrl.trim(),
      webAppUrl: webAppUrl.trim(),
      autoSync,
      status: webAppUrl.trim() ? 'connected' : 'disconnected',
      lastSyncTime: new Date().toISOString()
    };
    onSaveConfig(updated);
    setStatusMessage({ type: 'success', text: 'Konfigurasi Google Sheets berhasil disimpan!' });
  };

  // Push all data to Google Sheets
  const handlePushToSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan isi Web App URL terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengirim seluruh data ke Google Sheet...' });

    try {
      const res = await storageService.syncToGoogleSheets(webAppUrl.trim(), {
        ingredients,
        recipes,
        wasteLogs,
        settings
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengirim data ke Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all data from Google Sheets
  const handleFetchFromSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan isi Web App URL terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengambil data dari Google Sheet...' });

    try {
      const data = await storageService.fetchFromGoogleSheets(webAppUrl.trim());
      onDataImported(data);
      setStatusMessage({ type: 'success', text: 'Data dari Google Sheet berhasil dimuat ke aplikasi!' });
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengambil data dari Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Download JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaristaCost_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON file upload
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.ingredients || parsed.recipes || parsed.wasteLogs) {
          onDataImported(parsed);
          setStatusMessage({ type: 'success', text: 'Backup JSON berhasil di-restore!' });
        } else {
          setStatusMessage({ type: 'error', text: 'Format file JSON tidak sesuai.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'File JSON rusak atau tidak valid.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Integrasi Google Sheets & Google Apps Script</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Gunakan Google Sheets gratis sebagai database cloud permanen Anda dengan sinkronisasi 2 arah via Apps Script Web App.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
          >
            <span>Buka Google Sheet Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
            : statusMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
            : 'bg-amber-950/40 border-amber-700/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {statusMessage.type === 'info' && <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-200">✕</button>
        </div>
      )}

      {/* Grid: Setup Guide & Connection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Connection Config & 2-Way Sync */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <span>Pengaturan Koneksi Web App</span>
              </h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                sheetsConfig.webAppUrl 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}>
                {sheetsConfig.webAppUrl ? '● Terhubung' : '○ Belum Dikonfigurasi'}
              </span>
            </div>

            {/* Form URL */}
            <div className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-stone-300 font-semibold uppercase tracking-wider block">
                  Google Apps Script Web App URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-mono text-xs focus:border-emerald-500 focus:outline-none placeholder-stone-600"
                />
                <p className="text-[11px] text-stone-400">
                  Dapatkan URL ini setelah Deploy as Web App (Who has access: Anyone).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-semibold uppercase tracking-wider block">
                  Tautan Google Spreadsheet Anda (Opsional Bookmark)
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:border-emerald-500 focus:outline-none placeholder-stone-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {sheetUrl ? (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 text-xs font-semibold"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <span />}

                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold transition-colors"
                >
                  Simpan Konfigurasi
                </button>
              </div>

            </div>

            {/* Action Buttons for Sync */}
            <div className="pt-4 border-t border-stone-800 space-y-3">
              <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Aksi Sinkronisasi Data Real-Time:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handlePushToSheets}
                  disabled={isLoading}
                  className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Kirim Data ke Google Sheet</span>
                </button>

                <button
                  onClick={handleFetchFromSheets}
                  disabled={isLoading}
                  className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Tarik Data dari Sheet</span>
                </button>
              </div>
            </div>

          </div>

          {/* Backup, Restore & Reset Box */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Backup Lokal & Reset Database</span>
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={handleDownloadBackup}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 flex items-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh File Backup JSON</span>
              </button>

              <label className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 flex items-center gap-1.5 font-medium cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={onResetData}
                className="px-3 py-2 bg-stone-800/60 hover:bg-rose-950/40 text-stone-400 hover:text-rose-300 rounded-xl border border-stone-800 hover:border-rose-800 flex items-center gap-1.5 font-medium ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Demo Bawaan</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: 1-Click Code.gs & Step-by-Step Tutorial */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1-Click Apps Script Code Card */}
          <div className="bg-gradient-to-br from-amber-950/30 via-stone-900 to-stone-900 border border-amber-800/40 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-stone-100">Kode Google Apps Script (Code.gs)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Siap Pakai
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Script ini menangani pembagian tab otomatis (Bahan_Baku, Menu_Resep, Catatan_Waste), header warna rapi, dan API REST endpoint.
            </p>

            <button
              onClick={handleCopyCode}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                isCopied
                  ? 'bg-emerald-600 text-white shadow-emerald-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Kode Berhasil Disalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>1-Click Salin Kode Google Apps Script</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-stone-400 hover:text-stone-200 underline block text-center w-full"
            >
              {showCode ? 'Sembunyikan Preview Kode' : 'Lihat Preview Kode Apps Script'}
            </button>

            {showCode && (
              <div className="max-h-60 overflow-y-auto bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] font-mono text-stone-300 whitespace-pre">
                {GOOGLE_APPS_SCRIPT_CODE}
              </div>
            )}

          </div>

          {/* Step-by-Step Interactive Guide */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Panduan Pasang dalam 3 Menit</span>
            </h3>

            <ol className="space-y-3 text-xs text-stone-300">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  1
                </span>
                <p>
                  Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">sheets.new</a> untuk membuat spreadsheet kosong.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  2
                </span>
                <p>
                  Klik menu <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  3
                </span>
                <p>
                  Hapus kode default, lalu <strong>Paste kode</strong> dari tombol salin di atas. Tekan <strong>Ctrl+S (Save)</strong>.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  4
                </span>
                <p>
                  Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>New deployment (Penerapan baru)</strong>.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  5
                </span>
                <p>
                  Pilih icon Gerigi &gt; <strong>Web app</strong>. Set <strong>Who has access: Anyone</strong> (Siapa saja).
                </p>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                  6
                </span>
                <p>
                  Salin <strong>Web app URL</strong> yang berakhiran <code className="text-amber-300 font-mono">/exec</code> dan tempelkan di form sebelah kiri!
                </p>
              </li>
            </ol>
          </div>

        </div>

      </div>

    </div>
  );
};
