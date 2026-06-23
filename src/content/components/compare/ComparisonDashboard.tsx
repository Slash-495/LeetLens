import { TrendingUp, AlertTriangle, ArrowRight, Layers, Target } from 'lucide-react';
import type { ComparisonReport } from '../../../types/compare';
import { ExplainLikeIm12 } from '../ExplainLikeIm12';
import { ExpandableSection } from '../ExpandableSection';

export function ComparisonDashboard({ report }: { report: ComparisonReport }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      
      {/* Learning Takeaway */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Key Lesson</h3>
        </div>
        <p className="text-sm text-text font-medium leading-relaxed">{report.learningTakeaway}</p>
      </div>

      {/* Your Solution vs Optimal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface/30 border border-border/50 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Your Solution</span>
          <span className="text-sm font-bold text-text truncate">{report.userProfile.pattern}</span>
          <div className="flex gap-2 mt-2 text-[10px] font-mono text-muted flex-wrap">
            <span className="bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">T: {report.userProfile.timeComplexity}</span>
            <span className="bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">S: {report.userProfile.spaceComplexity}</span>
          </div>
        </div>

        <div className="bg-surface border border-accent/20 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl-lg">Optimal</div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Recommended</span>
          <span className="text-sm font-bold text-accent truncate" title={report.patternComparison.recommendedPattern}>{report.patternComparison.recommendedPattern}</span>
          <div className="flex gap-2 mt-2 text-[10px] font-mono text-muted flex-wrap">
            <span className="bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">T: See Analysis</span> 
          </div>
        </div>
      </div>

      <ExpandableSection title="Optimal Analysis" icon={<TrendingUp size={16} />} defaultExpanded>
        <div className="space-y-4">
          <div className="bg-surface/30 p-3 rounded-lg border border-border/50">
            <p className="text-sm text-text leading-relaxed">{report.optimalAnalysis.reasoning}</p>
            <ExplainLikeIm12 textToSimplify={report.optimalAnalysis.reasoning} />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface/30 p-2 rounded-lg border border-border/50">
              <span className="text-[10px] text-muted font-bold uppercase">Runtime</span>
              <p className="text-xs text-text mt-1">{report.optimalAnalysis.runtimeExplain}</p>
            </div>
            <div className="bg-surface/30 p-2 rounded-lg border border-border/50">
              <span className="text-[10px] text-muted font-bold uppercase">Memory</span>
              <p className="text-xs text-text mt-1">{report.optimalAnalysis.memoryExplain}</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Alternative Approaches" icon={<Layers size={16} />}>
        <div className="space-y-4">
          {report.alternatives.map((alt, idx) => (
            <div key={idx} className="bg-surface/30 p-3 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-text truncate pr-2">{alt.name}</h4>
                <div className="flex gap-1 text-[10px] font-mono shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-surface border border-border">T: {alt.timeComplexity}</span>
                  <span className="px-1.5 py-0.5 rounded bg-surface border border-border">S: {alt.spaceComplexity}</span>
                </div>
              </div>
              <p className="text-xs text-muted mb-2">{alt.tradeoffs}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-green-400 font-bold uppercase">Pros</span>
                  <ul className="list-disc ml-3 mt-1 text-[10px] text-text">
                    {alt.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] text-red-400 font-bold uppercase">Cons</span>
                  <ul className="list-disc ml-3 mt-1 text-[10px] text-text">
                    {alt.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection title="Tradeoff Explorer" icon={<AlertTriangle size={16} />}>
        <ul className="space-y-2">
          {report.tradeoffExplorer.map((tradeoff, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-text">
              <ArrowRight size={14} className="text-accent shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tradeoff}</span>
            </li>
          ))}
        </ul>
      </ExpandableSection>

    </div>
  );
}
