import { Download } from 'lucide-react';

export function ExportButton() {
  const handleExport = () => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get(null, (data) => {
      // Filter out API keys for safety
      const safeData = { ...data };
      delete safeData.aiProvider;
      delete safeData.apiKey;

      const blob = new Blob([JSON.stringify(safeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leetlens-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 bg-surface text-text text-xs font-medium rounded-lg border border-border hover:bg-surface/80 transition-colors"
    >
      <Download size={14} />
      Export Data
    </button>
  );
}
