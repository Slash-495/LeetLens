import type { Message } from './aiProvider';

export class ChatStorage {
  static async saveChat(problemUrl: string, messages: Message[]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const slug = this.extractSlug(problemUrl);
    if (!slug) return;
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [`chat_${slug}`]: messages }, () => resolve());
    });
  }

  static async loadChat(problemUrl: string): Promise<Message[]> {
    if (typeof chrome === 'undefined' || !chrome.storage) return [];
    const slug = this.extractSlug(problemUrl);
    if (!slug) return [];

    return new Promise((resolve) => {
      chrome.storage.local.get([`chat_${slug}`], (result: any) => {
        resolve(result[`chat_${slug}`] || []);
      });
    });
  }

  static async clearChat(problemUrl: string): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const slug = this.extractSlug(problemUrl);
    if (!slug) return;

    return new Promise((resolve) => {
      chrome.storage.local.remove([`chat_${slug}`], () => resolve());
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
