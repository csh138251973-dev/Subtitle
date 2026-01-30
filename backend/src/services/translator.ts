import { OpenAI } from 'openai';
import DomainKnowledgeService from './domainKnowledge.js';

export default class TranslationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
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
      let systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage === 'zh-CN' ? 'Simplified Chinese' : targetLanguage}. Only return the translated text, no explanations.`;

      if (domain) {
        systemPrompt += ` This text is from ${domain} domain, use domain-specific terminology.`;
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const translated = response.choices[0].message.content?.trim() || text;

      // Apply domain-specific translations if available
      if (domain) {
        return DomainKnowledgeService.applyDomainTranslation(translated, domain);
      }

      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
}
