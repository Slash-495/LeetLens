import type { ReviewReport } from '../types/review';

export class ReviewStorage {
  static async saveReview(problemUrl: string, review: ReviewReport): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const slug = this.extractSlug(problemUrl);
    if (!slug) return;
    
    const existingReviews = await this.loadReviews(problemUrl);
    existingReviews.unshift(review);
    
    // Keep max 5 reviews
    const trimmedReviews = existingReviews.slice(0, 5);

    return new Promise((resolve) => {
      chrome.storage.local.set({ [`review_${slug}`]: trimmedReviews }, () => resolve());
    });
  }

  static async loadReviews(problemUrl: string): Promise<ReviewReport[]> {
    if (typeof chrome === 'undefined' || !chrome.storage) return [];
    const slug = this.extractSlug(problemUrl);
    if (!slug) return [];

    return new Promise((resolve) => {
      chrome.storage.local.get([`review_${slug}`], (result: any) => {
        resolve(result[`review_${slug}`] || []);
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
