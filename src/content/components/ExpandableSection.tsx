import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableSection({ title, icon, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface/30">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-surface/50 hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
        <span className="text-muted">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
