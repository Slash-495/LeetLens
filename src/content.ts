// Wait for the DOM to be ready
function initContentScript() {
  console.log('[LeetLens] Content script injected.');
  
  // Try to find the problem title
  // We'll do a simple query for the title that works on the layout
  setTimeout(() => {
    const titleElement = document.querySelector('div[data-cy="question-title"]') || 
                         document.querySelector('.text-title-large a') ||
                         document.querySelector('.text-2xl');
                         
    if (titleElement) {
      console.log(`[LeetLens] Problem detected: ${titleElement.textContent?.trim()}`);
    } else {
      // Log current URL as fallback
      const urlParts = window.location.pathname.split('/');
      const problemSlugIndex = urlParts.indexOf('problems');
      if (problemSlugIndex !== -1 && urlParts.length > problemSlugIndex + 1) {
        const problemSlug = urlParts[problemSlugIndex + 1];
        console.log(`[LeetLens] Problem detected (from URL): ${problemSlug}`);
      }
    }
  }, 2000); // Delay to let React render the page
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
