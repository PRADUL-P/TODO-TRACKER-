import React, { useState } from 'react';
import storageService from '../services/storageService';
import parserService from '../services/parserService';
import { 
  Upload, 
  Download, 
  ClipboardPaste, 
  FileJson, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImportExport = () => {
  const [pasteContent, setPasteContent] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const handleExportJSON = () => {
    const data = storageService.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ludarp_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showStatus('success', 'Backup exported successfully!');
  };

  const handleExportCSV = () => {
    const tasks = storageService.getData('TASKS');
    if (tasks.length === 0) {
      showStatus('error', 'No tasks to export!');
      return;
    }
    const headers = ['Name', 'Type', 'Status', 'Date', 'Time Spent'];
    const rows = tasks.map(t => [t.name, t.type, t.status, t.date, t.timeSpent]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ludarp_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showStatus('success', 'CSV exported successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (storageService.importAll(data)) {
          showStatus('success', 'Data imported successfully!');
        } else {
          showStatus('error', 'Invalid file format.');
        }
      } catch (err) {
        showStatus('error', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePreview = () => {
    if (!pasteContent.trim()) return;
    const parsed = parserService.parseText(pasteContent);
    setPreviewData(parsed);
  };

  const confirmSmartImport = () => {
    if (!previewData) return;
    
    // Import each section
    if (previewData.tasks.length > 0) {
      const existing = storageService.getData('TASKS');
      storageService.setData('TASKS', [...existing, ...previewData.tasks]);
    }
    if (previewData.bim.length > 0) {
      const existing = storageService.getData('BIM_PROGRESS');
      storageService.setData('BIM_PROGRESS', [...existing, ...previewData.bim]);
    }
    if (previewData.psc.length > 0) {
      const existing = storageService.getData('PSC_TRACKER');
      storageService.setData('PSC_TRACKER', [...existing, ...previewData.psc]);
    }
    if (previewData.projects.length > 0) {
      const existing = storageService.getData('PROJECTS');
      storageService.setData('PROJECTS', [...existing, ...previewData.projects]);
    }

    setPreviewData(null);
    setPasteContent('');
    showStatus('success', 'Smart Import completed!');
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Management</h1>
        <p className="text-slate-500">Backup your data or import planning from external sources.</p>
      </div>

      <AnimatePresence>
        {status.message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Backup & Restore */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Save size={24} className="text-indigo-600" />
              Backup & Restore
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExportJSON}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
              >
                <FileJson size={32} />
                <span className="font-bold text-sm text-center">Export Full JSON</span>
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-800"
              >
                <FileSpreadsheet size={32} />
                <span className="font-bold text-sm text-center">Export Tasks CSV</span>
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Restore from Backup</label>
              <label className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-400 cursor-pointer transition-colors">
                <Upload size={20} className="text-slate-400" />
                <span className="text-slate-500 font-medium">Click to upload .json file</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Smart Text Import */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ClipboardPaste size={120} />
            </div>
            
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <ClipboardPaste size={24} className="text-orange-500" />
              Paste & Auto-Convert
            </h2>
            <p className="text-slate-500 text-sm mb-6">Drop your multiline text planning here. We'll handle the rest.</p>
            
            <textarea 
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Example:&#10;BIMS:&#10;- Learn Revit families&#10;PSC:&#10;- Quantitative Aptitude - Time & Work"
              className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-mono text-sm mb-4"
            />
            
            <button 
              onClick={handleParsePreview}
              disabled={!pasteContent.trim()}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              Parse & Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewData && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <h2 className="text-2xl font-bold mb-6">Preview Import Data</h2>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {previewData.tasks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tasks ({previewData.tasks.length})</h3>
                    <div className="space-y-2">
                      {previewData.tasks.map((t, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-100 dark:border-slate-700 flex justify-between">
                          <span>{t.name}</span>
                          <span className="text-indigo-500 font-bold">{t.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewData.bim.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">BIM Topics ({previewData.bim.length})</h3>
                    <div className="space-y-2">
                      {previewData.bim.map((t, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-100 dark:border-slate-700 flex justify-between">
                          <span>{t.topic}</span>
                          <span className="text-purple-500 font-bold">{t.stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewData.psc.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">PSC Topics ({previewData.psc.length})</h3>
                    <div className="space-y-2">
                      {previewData.psc.map((t, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-100 dark:border-slate-700 flex justify-between">
                          <span>{t.topic}</span>
                          <span className="text-amber-500 font-bold">{t.subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewData.projects.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Projects ({previewData.projects.length})</h3>
                    <div className="space-y-2">
                      {previewData.projects.map((t, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-100 dark:border-slate-700">
                          {t.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setPreviewData(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={confirmSmartImport}
                  className="flex-[2] bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 dark:shadow-none"
                >
                  Confirm & Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImportExport;
