export interface ProblemContext {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: string[];
  language: string;
  code: string;
  url: string;
}

export class LeetcodeExtractor {
  static async getProblemContext(): Promise<ProblemContext> {
    const titleElement = document.querySelector('div[data-cy="question-title"]') || 
                         document.querySelector('.text-title-large a') ||
                         document.querySelector('.text-2xl');
    const title = titleElement?.textContent?.trim() || 'Unknown Problem';

    let difficulty = 'Unknown';
    if (document.querySelector('.text-difficulty-easy')) difficulty = 'Easy';
    else if (document.querySelector('.text-difficulty-medium')) difficulty = 'Medium';
    else if (document.querySelector('.text-difficulty-hard')) difficulty = 'Hard';

    const descElement = document.querySelector('div[data-track-load="description_content"]') || 
                        document.querySelector('.elfjS');
    const fullText = descElement?.textContent || '';

    // Simple parsing for examples and constraints
    const examples: string[] = [];
    const constraints: string[] = [];
    
    const exampleParts = fullText.split(/Example \d+:/);
    for (let i = 1; i < exampleParts.length; i++) {
      const ex = exampleParts[i].split('Constraints:')[0].trim();
      examples.push(ex);
    }

    const constraintPart = fullText.split('Constraints:')[1];
    if (constraintPart) {
      constraints.push(...constraintPart.split('\n').filter(c => c.trim().length > 0));
    }

    const description = exampleParts[0]?.trim() || '';

    // Language is usually in a button with specific styling, we can look for Monaco's language class or a button
    let language = 'Unknown';
    const langBtn = document.querySelector('button.flex.cursor-pointer.items-center.rounded.text-left');
    if (langBtn) {
      language = langBtn.textContent?.trim() || 'Unknown';
    }

    const code = await this.extractLiveCode();

    return {
      title,
      difficulty,
      description,
      constraints,
      examples,
      language,
      code,
      url: window.location.href
    };
  }

  static extractLiveCode(): Promise<string> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'LEETLENS_CODE_RESULT') {
          window.removeEventListener('message', listener);
          resolve(event.data.code);
        }
      };
      window.addEventListener('message', listener);

      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('monaco-inject.js');
      script.onload = () => script.remove();
      document.documentElement.appendChild(script);

      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve('Code extraction timed out.');
      }, 1000);
    });
  }
}
