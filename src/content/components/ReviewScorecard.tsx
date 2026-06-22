import type { ReviewReport } from '../../types/review';

export function ReviewScorecard({ report }: { report: ReviewReport }) {
  const getScoreBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'bg-green-400';
    if (ratio >= 0.5) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Helper to extract the border color safely for tailwind
  const getBorderColorClass = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'border-green-400';
    if (ratio >= 0.5) return 'border-yellow-400';
    return 'border-red-400';
  };

  const getTextColorClass = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'text-green-400';
    if (ratio >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-xl bg-surface/50 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-lg font-bold text-text tracking-tight">Overall Score</h2>
          <p className="text-xs text-muted mt-0.5">Based on AI evaluation</p>
        </div>
        <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 ${getBorderColorClass(report.overallScore, 100)}`}>
          <span className={`text-xl font-bold ${getTextColorClass(report.overallScore, 100)}`}>
            {report.overallScore}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <ScoreRow label="Efficiency" score={report.efficiencyRating.score} max={10} colorFn={getScoreBarColor} />
        <ScoreRow label="Readability" score={report.readabilityRating.score} max={10} colorFn={getScoreBarColor} />
        <ScoreRow label="Interview Readiness" score={report.interviewReadiness.score} max={10} colorFn={getScoreBarColor} />
      </div>
    </div>
  );
}

function ScoreRow({ label, score, max, colorFn }: { label: string, score: number, max: number, colorFn: (s: number, m: number) => string }) {
  const percentage = (score / max) * 100;
  
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text">{label}</span>
        <span className="text-muted">{score}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${colorFn(score, max)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
