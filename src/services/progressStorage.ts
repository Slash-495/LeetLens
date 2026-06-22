import type { TimelineEvent, ProgressStats } from '../types/progress';

export class ProgressStorage {
  static async getProgressStats(): Promise<{ stats: ProgressStats, timeline: TimelineEvent[] }> {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(this.getEmptyStats());
        return;
      }

      chrome.storage.local.get(null, (items) => {
        const timeline: TimelineEvent[] = [];
        let totalScore = 0;
        let scoreCount = 0;
        const patternCounts: Record<string, number> = {};
        const activeDays = new Set<string>();

        for (const [key, value] of Object.entries(items)) {
          if (key.startsWith('review_')) {
            const slug = key.replace('review_', '');
            const reviews = value as any[];
            if (Array.isArray(reviews)) {
              reviews.forEach(r => {
                if (r.timestamp) activeDays.add(new Date(r.timestamp).toDateString());
                if (r.overallScore !== undefined) {
                  totalScore += r.overallScore;
                  scoreCount++;
                }
                timeline.push({
                  id: r.id || Math.random().toString(),
                  type: 'review',
                  timestamp: r.timestamp || Date.now(),
                  problemSlug: slug,
                  title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  score: r.overallScore
                });
              });
            }
          } else if (key.startsWith('visual_')) {
            const slug = key.replace('visual_', '');
            const trace = value as any;
            if (trace && trace.algorithmType) {
              const p = trace.algorithmType;
              patternCounts[p] = (patternCounts[p] || 0) + 1;
              const ts = trace.timestamp || Date.now();
              activeDays.add(new Date(ts).toDateString());
              timeline.push({
                id: `vis_${slug}_${ts}`,
                type: 'visualize',
                timestamp: ts,
                problemSlug: slug,
                title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                pattern: p,
                timeComplexity: trace.timeComplexity
              });
            }
          }
        }

        timeline.sort((a, b) => b.timestamp - a.timestamp);

        const totalVisualized = Object.keys(items).filter(k => k.startsWith('visual_')).length;
        const totalReviewed = Object.keys(items).filter(k => k.startsWith('review_')).length;

        // Basic heuristic for weakness
        const allPatterns = ["Two Pointers", "Sliding Window", "Dynamic Programming", "Binary Search", "Graphs", "Trees", "HashMap", "Backtracking"];
        const weaknesses = allPatterns.filter(p => !patternCounts[p]).slice(0, 3);
        const recommendations = weaknesses.length > 0 
          ? weaknesses.map(w => `Practice ${w}`) 
          : ["Try Advanced Graph Traversal", "Practice Hard Level DP"];

        const stats: ProgressStats = {
          totalReviewed,
          totalVisualized,
          daysActive: activeDays.size,
          patternCounts,
          averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
          weaknesses,
          recommendations
        };

        resolve({ stats, timeline });
      });
    });
  }

  static getEmptyStats(): { stats: ProgressStats, timeline: TimelineEvent[] } {
    return {
      stats: {
        totalReviewed: 0,
        totalVisualized: 0,
        daysActive: 0,
        patternCounts: {},
        averageScore: 0,
        weaknesses: [],
        recommendations: []
      },
      timeline: []
    };
  }
}
