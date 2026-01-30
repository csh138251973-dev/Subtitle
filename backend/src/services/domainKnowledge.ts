// Domain-specific vocabulary database
const DOMAIN_DATABASE: Record<string, Record<string, Record<string, string>>> = {
  minecraft: {
    gaming: {
      'creeper': '爬行者',
      'enderman': '末影人',
      'zombie': '僵尸',
      'skeleton': '骷髅',
      'spider': '蜘蛛',
      'crafting': '合成',
      'mining': '挖矿',
      'spawn': '生成',
      'mob': '怪物',
      'block': '方块',
      'biome': '生物群落',
      'nether': '下界',
      'end': '末地',
      'boss': '首领',
      'loot': '战利品',
      'pvp': '玩家对战',
      'survival': '生存模式',
      'creative': '创意模式',
      'redstone': '红石',
      'enchant': '附魔'
    }
  },
  medical: {
    healthcare: {
      'diagnosis': '诊断',
      'treatment': '治疗',
      'patient': '患者',
      'symptom': '症状',
      'disease': '疾病',
      'medication': '药物',
      'therapy': '疗法',
      'surgery': '手术',
      'recovery': '恢复',
      'infection': '感染'
    }
  },
  finance: {
    trading: {
      'stock': '股票',
      'investment': '投资',
      'portfolio': '投资组合',
      'dividend': '股息',
      'bullish': '看涨',
      'bearish': '看跌',
      'bull market': '牛市',
      'bear market': '熊市',
      'volatility': '波动性',
      'risk': '风险'
    }
  },
  legal: {
    law: {
      'contract': '合同',
      'agreement': '协议',
      'lawsuit': '诉讼',
      'plaintiff': '原告',
      'defendant': '被告',
      'verdict': '裁决',
      'appeal': '上诉',
      'testimony': '证词',
      'evidence': '证据',
      'jurisdiction': '管辖权'
    }
  },
  technology: {
    it: {
      'algorithm': '算法',
      'database': '数据库',
      'server': '服务器',
      'framework': '框架',
      'api': 'API接口',
      'debugging': '调试',
      'optimization': '优化',
      'deployment': '部署',
      'migration': '迁移',
      'scalability': '可扩展性'
    }
  }
};

export default class DomainKnowledgeService {
  static detectDomain(text: string): string | null {
    const textLower = text.toLowerCase();

    for (const [domain, categories] of Object.entries(DOMAIN_DATABASE)) {
      for (const [category, terms] of Object.entries(categories)) {
        for (const term of Object.keys(terms)) {
          if (textLower.includes(term)) {
            return domain;
          }
        }
      }
    }

    return null;
  }

  static applyDomainTranslation(text: string, domain: string): string {
    if (!DOMAIN_DATABASE[domain]) return text;

    let result = text;

    for (const categories of Object.values(DOMAIN_DATABASE[domain])) {
      for (const [english, chinese] of Object.entries(categories)) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        result = result.replace(regex, chinese);
      }
    }

    return result;
  }

  static getDomainVocabulary(domain: string): Record<string, string> {
    const vocab: Record<string, string> = {};

    if (DOMAIN_DATABASE[domain]) {
      for (const categories of Object.values(DOMAIN_DATABASE[domain])) {
        Object.assign(vocab, categories);
      }
    }

    return vocab;
  }

  static addDomainVocabulary(domain: string, category: string, term: string, translation: string) {
    if (!DOMAIN_DATABASE[domain]) {
      DOMAIN_DATABASE[domain] = {};
    }
    if (!DOMAIN_DATABASE[domain][category]) {
      DOMAIN_DATABASE[domain][category] = {};
    }

    DOMAIN_DATABASE[domain][category][term] = translation;
  }
}
