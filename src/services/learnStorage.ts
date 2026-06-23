import type { LearningGoal, FavoriteItem, LearningProfile } from '../types/learn';

export class LearnStorage {
  // --- Goals ---
  static async getGoals(): Promise<LearningGoal[]> {
    if (typeof chrome === 'undefined' || !chrome.storage) return [];
    return new Promise((resolve) => {
      chrome.storage.local.get('learningGoals', (res) => {
        resolve((res.learningGoals as LearningGoal[]) || []);
      });
    });
  }

  static async saveGoals(goals: LearningGoal[]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    await chrome.storage.local.set({ learningGoals: goals });
  }

  // --- Favorites ---
  static async getFavorites(): Promise<FavoriteItem[]> {
    if (typeof chrome === 'undefined' || !chrome.storage) return [];
    return new Promise((resolve) => {
      chrome.storage.local.get('favorites', (res) => {
        resolve((res.favorites as FavoriteItem[]) || []);
      });
    });
  }

  static async addFavorite(item: FavoriteItem): Promise<void> {
    const favs = await this.getFavorites();
    if (!favs.find(f => f.id === item.id)) {
      favs.push(item);
      await chrome.storage.local.set({ favorites: favs });
    }
  }

  static async removeFavorite(id: string): Promise<void> {
    let favs = await this.getFavorites();
    favs = favs.filter(f => f.id !== id);
    await chrome.storage.local.set({ favorites: favs });
  }

  // --- Profile Aggregation ---
  static async getLearningProfile(): Promise<LearningProfile> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return { totalSolved: 0, strongPatterns: [], weakPatterns: [], recentTopics: [], goalsCompleted: 0 };
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const patternScores: Record<string, { total: number; count: number }> = {};
        let totalSolved = 0;
        const recent: string[] = [];

        for (const [key, value] of Object.entries(items)) {
          if (key.startsWith('review_')) {
            totalSolved++;
            const v = value as any;
            if (v.pattern) {
              if (!patternScores[v.pattern]) patternScores[v.pattern] = { total: 0, count: 0 };
              const s = parseInt(v.score?.split('/')[0] || '0', 10);
              patternScores[v.pattern].total += s;
              patternScores[v.pattern].count += 1;
              
              if (!recent.includes(v.pattern)) recent.unshift(v.pattern);
            }
          }
        }

        const avgScores = Object.keys(patternScores).map(p => ({
          pattern: p,
          avg: patternScores[p].total / patternScores[p].count,
          count: patternScores[p].count
        }));

        avgScores.sort((a, b) => b.avg - a.avg);

        const strongPatterns = avgScores.filter(s => s.avg >= 7 || s.count >= 3).map(s => s.pattern).slice(0, 5);
        const weakPatterns = avgScores.filter(s => s.avg < 7 && s.count < 3).map(s => s.pattern).slice(0, 5);

        const goalsList = (items.learningGoals as any[]) || [];
        const goalsCompleted = goalsList.filter(g => g.completed).length;

        resolve({
          totalSolved,
          strongPatterns,
          weakPatterns,
          recentTopics: recent.slice(0, 5),
          goalsCompleted
        });
      });
    });
  }
}
