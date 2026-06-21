import type { ProblemContext } from '../../services/leetcodeExtractor';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Code, FileText, CheckCircle2 } from 'lucide-react';

export function OverviewTab({ context }: { context: ProblemContext }) {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Description Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text font-medium text-sm">
          <FileText size={16} className="text-accent" />
          <h3>Description Preview</h3>
        </div>
        <div className="p-3 bg-surface/50 border border-border rounded-xl text-sm text-muted line-clamp-4 leading-relaxed">
          {context.description || 'No description found.'}
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text font-medium text-sm">
          <Code size={16} className="text-accent" />
          <h3>Examples ({context.examples.length})</h3>
        </div>
        <div className="space-y-2">
          {context.examples.length > 0 ? (
            context.examples.slice(0, 2).map((ex, i) => (
              <div key={i} className="p-3 bg-surface/50 border border-border rounded-xl text-xs text-muted font-mono whitespace-pre-wrap overflow-x-auto">
                {ex}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted italic">No examples extracted.</p>
          )}
        </div>
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text font-medium text-sm">
          <CheckCircle2 size={16} className="text-accent" />
          <h3>Constraints</h3>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted pl-1">
          {context.constraints.length > 0 ? (
            context.constraints.map((c, i) => (
              <li key={i} className="font-mono text-xs">{c}</li>
            ))
          ) : (
            <li className="italic">No constraints extracted.</li>
          )}
        </ul>
      </div>

      {/* Editor State */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text font-medium text-sm">
          <Code size={16} className="text-accent" />
          <h3>Live Editor State</h3>
        </div>
        <div className="flex items-center justify-between p-3 bg-surface/50 border border-border rounded-xl text-sm">
          <span className="text-muted">Detected Language:</span>
          <span className="text-text font-medium">{context.language}</span>
        </div>
        <div className="p-3 bg-[#0d1117] border border-border rounded-xl text-xs text-muted font-mono whitespace-pre-wrap overflow-x-auto max-h-40">
          {context.code || '// No code extracted'}
        </div>
      </div>

      {/* Debug Context View (Collapsible) */}
      <div className="pt-4 border-t border-border border-dashed">
        <button 
          onClick={() => setIsDebugOpen(!isDebugOpen)}
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-text transition-colors w-full"
        >
          {isDebugOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Debug Context (JSON)
        </button>
        
        {isDebugOpen && (
          <div className="mt-3 p-3 bg-[#0d1117] border border-border rounded-xl overflow-x-auto">
            <pre className="text-[10px] text-muted font-mono">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
