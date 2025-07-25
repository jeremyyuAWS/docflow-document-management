import Sentiment from 'sentiment';

export interface SentimentResult {
  score: number;
  comparative: number;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

export interface MessageTone {
  sentiment: SentimentResult;
  tone: 'positive' | 'neutral' | 'negative';
  intensity: 'low' | 'medium' | 'high';
  suggestions: {
    tone: string;
    phrases: string[];
    words: string[];
  };
}

class SentimentAnalyzer {
  private analyzer: Sentiment;
  private positiveThreshold = 0.2;
  private negativeThreshold = -0.2;
  private intensityThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.9
  };

  constructor() {
    this.analyzer = new Sentiment();
  }

  analyzeMessage(text: string): MessageTone {
    const result = this.analyzer.analyze(text);
    const normalizedScore = result.comparative;

    const tone = this.determineTone(normalizedScore);
    const intensity = this.determineIntensity(Math.abs(normalizedScore));

    return {
      sentiment: result,
      tone,
      intensity,
      suggestions: this.generateSuggestions(tone, intensity)
    };
  }

  private determineTone(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > this.positiveThreshold) return 'positive';
    if (score < this.negativeThreshold) return 'negative';
    return 'neutral';
  }

  private determineIntensity(score: number): 'low' | 'medium' | 'high' {
    if (score > this.intensityThresholds.high) return 'high';
    if (score > this.intensityThresholds.medium) return 'medium';
    return 'low';
  }

  private generateSuggestions(tone: string, intensity: string): {
    tone: string;
    phrases: string[];
    words: string[];
  } {
    const suggestions = {
      tone: '',
      phrases: [] as string[],
      words: [] as string[]
    };

    if (tone === 'negative' && intensity === 'high') {
      suggestions.tone = 'Consider softening the tone';
      suggestions.phrases = [
        'I understand your concern',
        'Let me help resolve this',
        'We appreciate your patience'
      ];
      suggestions.words = ['assist', 'support', 'resolve', 'help'];
    } else if (tone === 'negative' && intensity === 'medium') {
      suggestions.tone = 'Add more empathetic language';
      suggestions.phrases = [
        'We understand this might be frustrating',
        'We are here to help',
        'Let us work together on this'
      ];
      suggestions.words = ['understand', 'help', 'together', 'solution'];
    } else if (tone === 'neutral') {
      suggestions.tone = 'Add more engaging elements';
      suggestions.phrases = [
        'We are excited to help',
        'Looking forward to resolving this',
        'Thank you for your collaboration'
      ];
      suggestions.words = ['appreciate', 'value', 'collaborate', 'assist'];
    }

    return suggestions;
  }

  adaptMessage(originalMessage: string, customerSentiment: number): string {
    const messageTone = this.analyzeMessage(originalMessage);
    
    // If customer sentiment is negative, make message more empathetic
    if (customerSentiment < 0) {
      const empathyPhrases = [
        'I understand this might be a busy time for you. ',
        'We are here to help make this process easier. ',
        'I appreciate your attention to this matter. '
      ];
      return empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)] + originalMessage;
    }
    
    // If customer sentiment is neutral, maintain professional tone
    if (customerSentiment === 0) {
      return originalMessage;
    }
    
    // If customer sentiment is positive, maintain enthusiasm
    const positiveAdditions = [
      'Thank you for your continued cooperation. ',
      'We appreciate your prompt responses. ',
      'It is great working with you on this. '
    ];
    return originalMessage + ' ' + positiveAdditions[Math.floor(Math.random() * positiveAdditions.length)];
  }

  suggestNextAction(customerSentiment: number): string {
    if (customerSentiment < -0.5) {
      return 'Consider scheduling a personal call to address concerns';
    } else if (customerSentiment < 0) {
      return 'Follow up with a more detailed explanation';
    } else if (customerSentiment > 0.5) {
      return 'Good opportunity to request additional documents';
    } else {
      return 'Maintain current communication approach';
    }
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();