import type { VisualizerStep } from '../../../types/visualizer';

export function VisualizerEngine({ step }: { step: VisualizerStep }) {
  if (step.arrayState) {
    return (
      <div className="flex flex-col gap-4 py-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 px-2 min-w-max">
          {step.arrayState.values.map((val, idx) => {
            const isHighlighted = step.arrayState?.highlights?.includes(idx);
            
            // Find all pointers pointing to this index
            const activePointers = Object.entries(step.arrayState?.pointers || {})
              .filter(([_, ptrIdx]) => ptrIdx === idx)
              .map(([name]) => name);

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={`
                  w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg font-semibold
                  transition-all duration-300 border-2
                  ${isHighlighted ? 'bg-accent/20 border-accent text-accent scale-110 shadow-[0_0_15px_rgba(var(--color-accent),0.2)]' : 'bg-surface border-border text-text'}
                `}>
                  {val}
                </div>
                <div className="text-[10px] text-muted text-center font-mono">
                  {idx}
                </div>
                <div className="min-h-[20px] flex flex-col items-center justify-end gap-0.5">
                  {activePointers.map(ptr => (
                    <span key={ptr} className="text-[10px] font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded">
                      ↑ {ptr}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step.stringState) {
    return (
      <div className="flex flex-col gap-4 py-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 px-2 min-w-max">
          {step.stringState.value.split('').map((char, idx) => {
            const activePointers = Object.entries(step.stringState?.pointers || {})
              .filter(([_, ptrIdx]) => ptrIdx === idx)
              .map(([name]) => name);

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="w-8 h-10 flex items-center justify-center rounded font-mono text-lg text-text border-b-2 border-border bg-surface/30">
                  {char}
                </div>
                <div className="min-h-[20px] flex flex-col items-center justify-end">
                  {activePointers.map(ptr => (
                    <span key={ptr} className="text-[10px] font-bold text-accent">
                      ↑ {ptr.charAt(0)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step.mapState) {
    return (
      <div className="py-2">
        <div className="bg-surface/50 border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-2 font-mono">Key</th>
                <th className="px-4 py-2 font-mono">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Object.entries(step.mapState).map(([k, v]) => (
                <tr key={k} className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-2 font-mono font-medium text-text">{k}</td>
                  <td className="px-4 py-2 font-mono text-accent">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (step.dpState) {
    return (
      <div className="py-2 overflow-x-auto custom-scrollbar">
        <table className="border-collapse m-auto">
          <tbody>
            {step.dpState.matrix.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => {
                  const isActive = step.dpState?.activeCell?.[0] === rIdx && step.dpState?.activeCell?.[1] === cIdx;
                  return (
                    <td key={cIdx} className={`
                      w-10 h-10 border border-border text-center font-mono text-sm transition-all duration-300
                      ${isActive ? 'bg-accent/20 text-accent font-bold scale-110 shadow-lg relative z-10' : 'text-text'}
                    `}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-32 text-sm text-muted italic border border-dashed border-border/50 rounded-xl bg-surface/20">
      Visual representation not available for this data structure. Follow the variables above.
    </div>
  );
}
