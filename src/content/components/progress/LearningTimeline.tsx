import { CheckCircle2, Eye } from 'lucide-react';
import type { TimelineEvent } from '../../../types/progress';

export function LearningTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <div className="text-sm text-muted text-center py-4">No activity history.</div>;
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="flex gap-3 bg-surface/30 border border-border/50 rounded-xl p-3">
          <div className="mt-0.5">
            {event.type === 'review' ? (
              <CheckCircle2 size={16} className="text-green-400" />
            ) : (
              <Eye size={16} className="text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text truncate">{event.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted">
              <span>{new Date(event.timestamp).toLocaleDateString()}</span>
              <span>•</span>
              {event.type === 'review' ? (
                <span className="truncate">Score: {event.score}/100</span>
              ) : (
                <span className="truncate">Pattern: {event.pattern}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
