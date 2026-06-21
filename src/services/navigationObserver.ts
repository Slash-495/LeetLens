export class NavigationObserver {
  private static observer: MutationObserver | null = null;
  private static currentUrl = window.location.href;

  static start(onNavigate: (newUrl: string) => void) {
    if (this.observer) return;

    // Observe title changes as a reliable indicator of SPA navigation in LeetCode
    const titleElement = document.querySelector('title');
    if (titleElement) {
      this.observer = new MutationObserver(() => {
        if (window.location.href !== this.currentUrl) {
          this.currentUrl = window.location.href;
          onNavigate(this.currentUrl);
        }
      });
      this.observer.observe(titleElement, { childList: true, subtree: true });
    }
  }

  static stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
