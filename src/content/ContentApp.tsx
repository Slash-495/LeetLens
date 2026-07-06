import { useState, useEffect } from 'react';
import { FloatingButton } from './components/FloatingButton';
import { SlidePanel } from './components/SlidePanel';
import { LeetcodeExtractor, type ProblemContext } from '../services/leetcodeExtractor';
import { NavigationObserver } from '../services/navigationObserver';

export function ContentApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ProblemContext | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isContest, setIsContest] = useState(() => window.location.href.includes('contest'));

  const extractContext = async (showSpinner = true) => {
    if (isContest) return;
    if (showSpinner) setIsExtracting(true);
    try {
      const result = await LeetcodeExtractor.getProblemContext();
      setContext(result);
    } catch (e: any) {
      if (e?.message?.includes('Extension context invalidated')) {
        return;
      }
      console.error('[LeetLens] Error extracting context', e);
    } finally {
      if (showSpinner) setIsExtracting(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isContest) {
      setTimeout(() => extractContext(true), 1500);
      interval = setInterval(() => extractContext(false), 2000);
    }

    NavigationObserver.start((newUrl) => {
      const contest = newUrl.includes('contest');
      setIsContest(contest);
      if (!contest) {
        setTimeout(() => extractContext(true), 1000);
      } else {
        setContext(null);
        setIsOpen(false); // Optionally close panel if they enter a contest
      }
    });

    return () => {
      NavigationObserver.stop();
      if (interval) clearInterval(interval);
    };
  }, [isContest]);

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
        onRefresh={() => extractContext(true)}
        isContest={isContest}
      />
    </>
  );
}
