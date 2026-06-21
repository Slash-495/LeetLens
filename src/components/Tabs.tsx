import { MessageCircle, CheckCircle, Eye, TrendingUp } from 'lucide-react';

export function Tabs() {
  const tabs = [
    { name: 'Chat', icon: <MessageCircle size={18} /> },
    { name: 'Review', icon: <CheckCircle size={18} /> },
    { name: 'Visualize', icon: <Eye size={18} /> },
    { name: 'Progress', icon: <TrendingUp size={18} /> }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {tabs.map((tab) => (
        <div 
          key={tab.name}
          className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-surface opacity-50 cursor-not-allowed group relative transition-colors"
        >
          <div className="text-muted mb-1.5 group-hover:text-text transition-colors">{tab.icon}</div>
          <span className="text-[11px] text-muted font-medium group-hover:text-text transition-colors">{tab.name}</span>
          
          {/* Tooltip */}
          <div className="absolute -bottom-9 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border text-xs px-2.5 py-1.5 rounded-lg text-text whitespace-nowrap z-20 pointer-events-none shadow-sm">
            Coming in Phase 2
          </div>
        </div>
      ))}
    </div>
  );
}
