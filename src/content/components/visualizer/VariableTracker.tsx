export function VariableTracker({ variables }: { variables: Record<string, string | number | boolean> }) {
  if (!variables || Object.keys(variables).length === 0) return null;

  return (
    <div className="bg-surface/30 border border-border/50 rounded-xl p-3">
      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Variables</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="flex flex-col bg-surface/50 rounded-md px-2 py-1">
            <span className="text-[10px] text-muted font-mono truncate">{key}</span>
            <span className="text-sm font-mono text-accent truncate">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
