import { useState, useEffect } from 'react';
import { FloatingButton } from './components/FloatingButton';
import { SlidePanel } from './components/SlidePanel';
import { LeetcodeExtractor, type ProblemContext } from '../services/leetcodeExtractor';
import { NavigationObserver } from '../services/navigationObserver';

export function ContentApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ProblemContext | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractContext = async () => {
    setIsExtracting(true);
    try {
      const result = await LeetcodeExtractor.getProblemContext();
      setContext(result);
    } catch (e) {
      console.error('[LeetLens] Error extracting context', e);
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    // Initial extraction with a slight delay to ensure LeetCode DOM is ready
    setTimeout(extractContext, 1500);

    // Re-extract on navigation
    NavigationObserver.start(() => {
      setTimeout(extractContext, 1000);
    });

    return () => {
      NavigationObserver.stop();
    };
  }, []);

  return (
    <>
      <FloatingButton 
        onClick={() => setIsOpen(true)} 
        isVisible={!isOpen} 
      />
      
      <SlidePanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        context={context}
        isExtracting={isExtracting}
        onRefresh={extractContext}
      />
    </>
  );
}
