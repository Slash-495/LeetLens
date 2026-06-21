import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AIService, type Message, type AIProviderName } from '../../services/aiProvider';
import { PromptBuilder } from '../../services/promptBuilder';
import { ChatStorage } from '../../services/chatStorage';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import { Trash2, MessageSquarePlus, RefreshCw } from 'lucide-react';

export function ChatTab({ context }: { context: ProblemContext | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
      });
    }

    if (context?.url) {
      ChatStorage.loadChat(context.url).then(saved => {
        if (saved && saved.length > 0) setMessages(saved);
      });
    }
  }, [context?.url]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    if (context?.url) {
      ChatStorage.saveChat(context.url, msgs);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setError(null);

    const userMsg: Message = { id: uuidv4(), role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    saveMessages(newMessages);
    setIsTyping(true);

    const assistantMsgId = uuidv4();
    let currentResponse = '';

    setMessages([...newMessages, { id: assistantMsgId, role: 'assistant', content: '' }]);

    const systemPrompt = PromptBuilder.buildSystemPrompt(context);

    await AIService.streamChat(
      provider,
      apiKey,
      systemPrompt,
      newMessages,
      {
        onChunk: (chunk) => {
          currentResponse += chunk;
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: currentResponse } : m
          ));
        },
        onDone: () => {
          setIsTyping(false);
          saveMessages([...newMessages, { id: assistantMsgId, role: 'assistant', content: currentResponse }]);
        },
        onError: (err) => {
          setIsTyping(false);
          setError(err.message);
          setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        }
      }
    );
  };

  const handleHint = () => {
    const prompt = PromptBuilder.buildHintPrompt(hintLevel);
    setHintLevel(prev => (prev < 4 ? prev + 1 : 4));
    handleSend(prompt);
  };

  const handleClear = () => {
    saveMessages([]);
    setHintLevel(1);
    setError(null);
  };

  const handleDelete = (id: string) => {
    saveMessages(messages.filter(m => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          {provider} Model
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="p-1.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Clear Chat">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent shadow-sm">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">How can I help?</h3>
              <p className="text-xs text-muted mt-1 max-w-[250px] leading-relaxed">Ask anything about this problem. I already know your code and the context.</p>
            </div>
          </div>
        ) : (
          messages.map(m => (
            <ChatMessage 
              key={m.id} 
              message={m} 
              onDelete={() => handleDelete(m.id)}
              isStreaming={isTyping && m.id === messages[messages.length - 1].id && m.role === 'assistant'}
            />
          ))
        )}
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
        
        {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            <RefreshCw size={12} className="animate-spin text-accent" />
            Thinking...
          </div>
        )}
      </div>

      <ChatInput 
        onSend={handleSend} 
        onHint={handleHint}
        disabled={isTyping || !apiKey}
        isEmpty={messages.length === 0}
      />
    </div>
  );
}
