import { ArrowUp, Lightbulb } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (msg: string) => void;
  onHint: () => void;
  disabled: boolean;
  isEmpty: boolean;
}

export function ChatInput({ onSend, onHint, disabled, isEmpty }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const quickActions = [
    { label: 'Explain Problem', prompt: 'Explain this problem to me simply.' },
    { label: 'Optimal Approach', prompt: 'What is the optimal approach to solve this?' },
    { label: 'Explain Code', prompt: 'Explain my current code step-by-step.' },
    { label: 'Find Edge Cases', prompt: 'What edge cases am I missing?' },
    { label: 'Generate Test Cases', prompt: 'Give me some difficult test cases.' }
  ];

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-border bg-background">
      {isEmpty && (
        <div className="flex flex-wrap gap-2 mb-2">
          <button 
            onClick={onHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20"
          >
            <Lightbulb size={12} /> Give Hint
          </button>
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => onSend(action.prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface text-muted hover:text-text hover:bg-surface/80 transition-colors border border-border"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-surface border border-border rounded-xl p-2 focus-within:border-accent transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this problem..."
          disabled={disabled}
          className="flex-1 max-h-[150px] bg-transparent text-sm text-text placeholder:text-muted resize-none focus:outline-none px-2 py-1 scrollbar-hide"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
