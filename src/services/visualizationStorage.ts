import type { VisualizationTrace } from '../types/visualizer';

export class VisualizationStorage {
  static async saveTrace(problemUrl: string, trace: VisualizationTrace): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const slug = this.extractSlug(problemUrl);
    if (!slug) return;
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [`visual_${slug}`]: trace }, () => resolve());
    });
  }

  static async loadTrace(problemUrl: string): Promise<VisualizationTrace | null> {
    if (typeof chrome === 'undefined' || !chrome.storage) return null;
    const slug = this.extractSlug(problemUrl);
    if (!slug) return null;

    return new Promise((resolve) => {
      chrome.storage.local.get([`visual_${slug}`], (result: any) => {
        resolve(result[`visual_${slug}`] || null);
      });
    });
  }

  private static extractSlug(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      const idx = parts.indexOf('problems');
      if (idx !== -1 && parts[idx + 1]) {
        return parts[idx + 1];
      }
      return null;
    } catch {
      return null;
    }
  }
}
