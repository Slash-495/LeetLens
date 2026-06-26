interface FloatingButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function FloatingButton({ onClick, isVisible }: FloatingButtonProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border shadow-lg cursor-pointer hover:scale-105 transition-all duration-200 group overflow-hidden"
      onClick={onClick}
    >
      <img src={chrome.runtime.getURL('icon.png')} alt="LeetLens" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
