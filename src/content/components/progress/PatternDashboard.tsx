export function PatternDashboard({ counts }: { counts: Record<string, number> }) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted.length > 0 ? sorted[0][1] : 1;

  if (sorted.length === 0) {
    return <div className="text-sm text-muted text-center py-4">No pattern data yet. Visualize some solutions!</div>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(([pattern, count]) => (
        <div key={pattern} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text">{pattern}</span>
            <span className="text-muted">{count}x</span>
          </div>
          <div className="w-full h-2 bg-surface/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
