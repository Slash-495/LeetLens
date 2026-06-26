import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border overflow-hidden">
          <img src="/icon.png" alt="LeetLens" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-lg font-semibold text-text tracking-tight">LeetLens</h1>
      </div>
      <button 
        onClick={onOpenSettings}
        className="p-2 rounded-lg hover:bg-surface text-muted hover:text-text transition-colors"
      >
        <Settings size={18} />
      </button>
    </header>
  );
}
