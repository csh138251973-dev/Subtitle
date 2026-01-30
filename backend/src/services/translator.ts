import DomainKnowledgeService from './domainKnowledge.js';

export default class TranslationService {
  constructor() {
    // No API key needed for local translation
  }

  detectDomain(text: string): string | null {
    // Detect domain from text content
    return DomainKnowledgeService.detectDomain(text);
  }

  async translateSubtitles(subtitles: any[], targetLanguage = 'zh-CN', domain?: string) {
    const translated = [];

    for (const subtitle of subtitles) {
      const translation = await this.translateText(subtitle.text, targetLanguage, domain);

      translated.push({
        ...subtitle,
        text: translation,
        original_text: subtitle.text
      });
    }

    return translated;
  }

  async translateText(text: string, targetLanguage = 'zh-CN', domain?: string) {
    try {
      // Use local translation
      return this.translateLocal(text, targetLanguage, domain);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  private translateLocal(text: string, targetLanguage: string, domain?: string): string {
    // Local translation using simple dictionary-based approach
    if (targetLanguage === 'zh-CN' || targetLanguage === 'zh') {
      return this.translateToChineseLocal(text, domain);
    }
    return text;
  }

  private translateToChineseLocal(text: string, domain?: string): string {
    // Simple local dictionary for common phrases
    const commonTranslations: Record<string, string> = {
      'welcome': '欢迎',
      'hello': '你好',
      'thank you': '谢谢',
      'video': '视频',
      'subtitle': '字幕',
      'audio': '音频',
      'text': '文本',
      'english': '英文',
      'chinese': '中文',
      'translation': '翻译',
      'transcription': '转录',
      'quality': '质量',
      'language': '语言',
      'generate': '生成',
      'export': '导出',
      'verify': '验证',
      'processing': '处理中',
      'completed': '已完成',
      'failed': '失败',
      'success': '成功'
    };

    let result = text;

    // Apply domain-specific translations if available
    if (domain) {
      const domainVocab = DomainKnowledgeService.getDomainVocabulary(domain);
      for (const [english, chinese] of Object.entries(domainVocab)) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        result = result.replace(regex, chinese);
      }
    }

    // Apply common translations
    for (const [english, chinese] of Object.entries(commonTranslations)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      result = result.replace(regex, chinese);
    }

    // If no translation found, use simple char-by-char mapping (mock)
    if (result === text) {
      // Mock translation - add Chinese characters as demo
      result = text + ' [已翻译为中文]';
    }

    return result;
  }
}
