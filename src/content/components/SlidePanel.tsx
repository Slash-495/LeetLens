import { X, RefreshCw, LayoutDashboard, MessageCircle, CheckCircle, Eye, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import { OverviewTab } from './OverviewTab';
import { ChatTab } from './ChatTab';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: ProblemContext | null;
  isExtracting: boolean;
  onRefresh: () => void;
  isContest?: boolean;
}

export function SlidePanel({ isOpen, onClose, context, isExtracting, onRefresh, isContest }: SlidePanelProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    { name: 'Overview', icon: <LayoutDashboard size={16} /> },
    { name: 'Chat', icon: <MessageCircle size={16} /> },
    { name: 'Review', icon: <CheckCircle size={16} />, disabled: true },
    { name: 'Visualize', icon: <Eye size={16} />, disabled: true },
    { name: 'Progress', icon: <TrendingUp size={16} />, disabled: true }
  ];

  return (
    <div 
      className={`fixed top-0 right-0 h-screen w-[400px] bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col z-[2147483647] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border">
            <span className="text-accent font-bold text-sm">LL</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text leading-tight">LeetLens</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted truncate max-w-[180px]" title={context?.title || ''}>
                {context?.title || 'Loading problem...'}
              </span>
              {context?.difficulty && context.difficulty !== 'Unknown' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  context.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                  context.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                  context.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                  'bg-surface text-muted'
                }`}>
                  {context.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            disabled={isExtracting}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50"
            title="Refresh Context"
          >
            <RefreshCw size={16} className={isExtracting ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 p-2 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => !tab.disabled && setActiveTab(tab.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative group ${
              activeTab === tab.name 
                ? 'bg-surface text-text' 
                : tab.disabled 
                  ? 'text-muted/50 cursor-not-allowed' 
                  : 'text-muted hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab.icon}
            {tab.name}
            {tab.disabled && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border text-[10px] px-2 py-1 rounded text-text whitespace-nowrap z-20 pointer-events-none shadow-sm">
                Phase 3
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {isContest ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
              <span className="font-bold text-xl">!</span>
            </div>
            <p className="text-sm text-text font-medium">LeetLens is unavailable during LeetCode contests.</p>
            <p className="text-xs text-muted">Contest mode detected. AI assistance and code extraction are disabled to ensure fair play.</p>
          </div>
        ) : isExtracting && !context ? (
          <div className="flex flex-col items-center justify-center h-full text-muted gap-3">
            <RefreshCw className="animate-spin" size={24} />
            <p className="text-sm">Extracting problem context...</p>
          </div>
        ) : !context ? (
          <div className="flex flex-col items-center justify-center h-full text-muted gap-3">
            <p className="text-sm text-center">Unable to read problem details.</p>
            <button 
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium bg-surface text-text rounded-lg hover:bg-surface/80 transition-colors border border-border"
            >
              Retry Extraction
            </button>
          </div>
        ) : activeTab === 'Overview' ? (
          <OverviewTab context={context} />
        ) : activeTab === 'Chat' ? (
          <ChatTab context={context} />
        ) : null}
      </div>
    </div>
  );
}
