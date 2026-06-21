import { Code, Coffee, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto p-4 border-t border-border bg-background flex justify-center gap-6">
      <a href="#" className="text-muted hover:text-text transition-colors flex items-center gap-1.5 text-sm">
        <Code size={14} /> GitHub
      </a>
      <a href="#" className="text-muted hover:text-text transition-colors flex items-center gap-1.5 text-sm">
        <Coffee size={14} /> Support
      </a>
      <a href="#" className="text-muted hover:text-text transition-colors flex items-center gap-1.5 text-sm">
        <MessageSquare size={14} /> Feedback
      </a>
    </footer>
  );
}
