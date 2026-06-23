import type { ComparisonReport } from '../types/compare';

export class CompareStorage {
  static async saveComparison(url: string, report: ComparisonReport): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const slug = this.getSlug(url);
    if (!slug) return;

    report.id = `cmp_${slug}_${Date.now()}`;
    report.timestamp = Date.now();

    await chrome.storage.local.set({ [`compare_${slug}`]: report });
  }

  static async loadComparison(url: string): Promise<ComparisonReport | null> {
    if (typeof chrome === 'undefined' || !chrome.storage) return null;
    const slug = this.getSlug(url);
    if (!slug) return null;

    return new Promise((resolve) => {
      chrome.storage.local.get(`compare_${slug}`, (res) => {
        resolve((res[`compare_${slug}`] as ComparisonReport) || null);
      });
    });
  }

  private static getSlug(url: string): string | null {
    try {
      const match = url.match(/problems\/([^\/]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
