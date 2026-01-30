export default class QualityVerifierService {
  generateQualityReport(translated: any[], original: any[], duration: number | undefined, domain: string | undefined) {
    const metrics = {
      completeness: this.calculateCompleteness(translated, original),
      timing_accuracy: this.calculateTimingAccuracy(translated, duration),
      text_quality: this.calculateTextQuality(translated),
      domain_relevance: domain ? this.calculateDomainRelevance(translated, domain) : 1.0,
      consistency: this.calculateConsistency(translated),
      semantic_coherence: this.calculateSemanticCoherence(translated)
    };

    const overallScore = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;

    return {
      overall_quality_score: Math.round(overallScore * 100) / 100,
      metrics,
      quality_level: this.getQualityLevel(overallScore),
      issues: this.identifyIssues(translated, original, duration),
      recommendations: this.generateRecommendations(metrics),
      generated_at: new Date().toISOString()
    };
  }

  private calculateCompleteness(translated: any[], original: any[]): number {
    if (!original || original.length === 0) return 1.0;
    return Math.min(translated.length / original.length, 1.0);
  }

  private calculateTimingAccuracy(subtitles: any[], duration: number | undefined): number {
    if (!duration || subtitles.length === 0) return 1.0;

    let accurateCount = 0;
    for (const sub of subtitles) {
      if (sub.start >= 0 && sub.end <= duration && sub.start < sub.end) {
        accurateCount++;
      }
    }

    return accurateCount / subtitles.length;
  }

  private calculateTextQuality(subtitles: any[]): number {
    if (subtitles.length === 0) return 1.0;

    let validCount = 0;
    for (const sub of subtitles) {
      const text = sub.text || '';
      if (text.trim().length > 0 && text.trim().length < 500) {
        validCount++;
      }
    }

    return validCount / subtitles.length;
  }

  private calculateDomainRelevance(subtitles: any[], domain: string): number {
    return 0.8;
  }

  private calculateConsistency(subtitles: any[]): number {
    if (subtitles.length < 2) return 1.0;

    let totalGap = 0;
    for (let i = 1; i < subtitles.length; i++) {
      const gap = subtitles[i].start - subtitles[i - 1].end;
      totalGap += Math.abs(gap);
    }

    const avgGap = totalGap / (subtitles.length - 1);
    return Math.max(0, 1 - (avgGap / 10));
  }

  private calculateSemanticCoherence(subtitles: any[]): number {
    if (subtitles.length === 0) return 1.0;

    let coherentCount = 0;
    for (let i = 1; i < subtitles.length; i++) {
      const prevText = subtitles[i - 1].text || '';
      const currText = subtitles[i].text || '';

      // Simple check: if both have content, assume coherence
      if (prevText.trim().length > 0 && currText.trim().length > 0) {
        coherentCount++;
      }
    }

    return subtitles.length > 1 ? coherentCount / (subtitles.length - 1) : 1.0;
  }

  private getQualityLevel(score: number): string {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'fair';
    return 'poor';
  }

  private identifyIssues(translated: any[], original: any[], duration: number | undefined): string[] {
    const issues = [];

    if (!translated || translated.length === 0) {
      issues.push('No subtitles found');
    }

    if (duration && original) {
      const totalDuration = Math.max(...original.map((s: any) => s.end || 0));
      if (totalDuration < duration * 0.5) {
        issues.push('Subtitle coverage is less than 50% of video duration');
      }
    }

    const emptyCount = translated.filter((s: any) => !s.text || s.text.trim().length === 0).length;
    if (emptyCount > 0) {
      issues.push(`${emptyCount} empty subtitle entries found`);
    }

    return issues;
  }

  private generateRecommendations(metrics: Record<string, number>): string[] {
    const recommendations = [];

    if (metrics.completeness < 0.9) {
      recommendations.push('Consider reviewing missing subtitle segments');
    }

    if (metrics.timing_accuracy < 0.9) {
      recommendations.push('Some subtitles have timing issues, review and adjust');
    }

    if (metrics.text_quality < 0.9) {
      recommendations.push('Some subtitles have text quality issues');
    }

    if (metrics.consistency < 0.7) {
      recommendations.push('Subtitle timing is inconsistent, consider smoothing');
    }

    if (metrics.semantic_coherence < 0.8) {
      recommendations.push('Check semantic coherence between consecutive subtitles');
    }

    if (recommendations.length === 0) {
      recommendations.push('Subtitles meet quality standards ✓');
    }

    return recommendations;
  }
}
