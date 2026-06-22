import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface PlaybackPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  canNext: boolean;
  canPrev: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function PlaybackPlayer({ isPlaying, onPlayPause, onNext, onPrev, onRestart, canNext, canPrev, speed, onSpeedChange }: PlaybackPlayerProps) {
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="flex items-center justify-between bg-surface/50 border border-border rounded-xl p-2 shadow-sm">
      <div className="flex items-center gap-1">
        <button onClick={onRestart} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors" title="Restart">
          <RotateCcw size={16} />
        </button>
        <button onClick={onPrev} disabled={!canPrev} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors disabled:opacity-30" title="Previous Step">
          <SkipBack size={16} />
        </button>
        <button onClick={onPlayPause} className="p-3 bg-accent text-white rounded-xl shadow-lg hover:bg-accent/90 transition-transform active:scale-95" title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={onNext} disabled={!canNext} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors disabled:opacity-30" title="Next Step">
          <SkipForward size={16} />
        </button>
      </div>

      <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden shadow-inner">
        {speeds.map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 text-[10px] font-bold transition-colors ${speed === s ? 'bg-accent/20 text-accent' : 'text-muted hover:bg-surface/80 hover:text-text'}`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
