import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, RefreshCw, Trash } from 'lucide-react';
import type { Message } from '../../services/aiProvider';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onDelete?: () => void;
  isStreaming?: boolean;
}

export function ChatMessage({ message, onRegenerate, onDelete, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${isUser ? 'items-end' : 'items-start'} group`}>
      <div 
        className={`max-w-[90%] p-3 rounded-2xl ${
          isUser 
            ? 'bg-accent text-white rounded-br-sm' 
            : 'bg-surface border border-border text-text rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="my-2 rounded-lg overflow-hidden border border-border">
                      <div className="flex items-center justify-between px-3 py-1 bg-[#1e1e1e] border-b border-border text-xs text-muted font-mono">
                        <span>{match[1]}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                          className="hover:text-text transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, background: '#0d1117', padding: '1rem' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className="bg-background px-1.5 py-0.5 rounded text-accent text-[0.9em]">
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content + (isStreaming ? ' ▍' : '')}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className={`flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && !isStreaming && onRegenerate && (
          <button onClick={onRegenerate} className="p-1 text-muted hover:text-text transition-colors" title="Regenerate">
            <RefreshCw size={12} />
          </button>
        )}
        <button onClick={copyToClipboard} className="p-1 text-muted hover:text-text transition-colors" title="Copy text">
          <Copy size={12} />
        </button>
        {onDelete && (
          <button onClick={onDelete} className="p-1 text-muted hover:text-red-400 transition-colors" title="Delete">
            <Trash size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
