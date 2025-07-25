import { CustomerDocument } from '../types';

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  confidence: number;
  rules: {
    keywords: string[];
    patterns: RegExp[];
    requirements?: string[];
  };
}

export interface AutoTagResult {
  tags: string[];
  confidence: number;
  suggestedTags: string[];
  metadata: {
    extractedDates: string[];
    entities: string[];
    keyPhrases: string[];
  };
}

export class DocumentClassifier {
  private categories: DocumentCategory[] = [
    {
      id: 'financial',
      name: 'Financial Documents',
      description: 'Documents related to financial transactions, statements, and reports',
      confidence: 0.9,
      rules: {
        keywords: ['invoice', 'statement', 'balance', 'payment', 'transaction', 'tax'],
        patterns: [
          /\$\s?\d+(?:\.\d{2})?/,
          /(?:19|20)\d{2}[\/-]\d{1,2}[\/-]\d{1,2}/
        ],
        requirements: ['amount', 'date', 'account']
      }
    },
    {
      id: 'legal',
      name: 'Legal Documents',
      description: 'Legal agreements, contracts, and compliance documents',
      confidence: 0.85,
      rules: {
        keywords: ['agreement', 'contract', 'terms', 'conditions', 'legal', 'compliance'],
        patterns: [
          /party of the (?:first|second) part/i,
          /hereby agrees to/i,
          /terms and conditions/i
        ],
        requirements: ['signatures', 'dates', 'parties']
      }
    },
    {
      id: 'identification',
      name: 'Identification Documents',
      description: 'Personal identification and verification documents',
      confidence: 0.95,
      rules: {
        keywords: ['passport', 'license', 'id', 'identification', 'certificate'],
        patterns: [
          /\b[A-Z]{2}[0-9]{6}\b/,
          /\b\d{3}-\d{2}-\d{4}\b/
        ],
        requirements: ['photo', 'expiration date', 'document number']
      }
    }
  ];

  private commonTags = new Set([
    'urgent',
    'confidential',
    'requires_signature',
    'expires_soon',
    'high_priority',
    'needs_review',
    'incomplete',
    'verified'
  ]);

  async classifyDocument(doc: CustomerDocument): Promise<DocumentCategory[]> {
    const matches = await Promise.all(
      this.categories.map(async category => {
        const score = await this.calculateCategoryScore(doc, category);
        return { category, score };
      })
    );

    return matches
      .filter(match => match.score > 0.7)
      .sort((a, b) => b.score - a.score)
      .map(match => ({
        ...match.category,
        confidence: match.score
      }));
  }

  async generateTags(doc: CustomerDocument): Promise<AutoTagResult> {
    const extractedText = await this.extractTextContent(doc);
    const metadata = await this.extractMetadata(extractedText);
    
    const tags = new Set<string>();
    const suggestedTags = new Set<string>();
    let confidenceSum = 0;
    let confidenceCount = 0;

    // Add category-based tags
    const categories = await this.classifyDocument(doc);
    categories.forEach(category => {
      tags.add(category.id);
      confidenceSum += category.confidence;
      confidenceCount++;
    });

    // Add urgency-based tags
    if (doc.ai_urgency_score > 80) {
      tags.add('urgent');
      tags.add('high_priority');
    }

    // Add status-based tags
    if (doc.status === 'overdue') {
      tags.add('overdue');
      tags.add('needs_attention');
    }

    // Generate suggested tags based on content analysis
    metadata.keyPhrases.forEach(phrase => {
      if (this.commonTags.has(phrase.toLowerCase())) {
        suggestedTags.add(phrase.toLowerCase());
      }
    });

    // Add date-related tags
    if (metadata.extractedDates.length > 0) {
      const now = new Date();
      metadata.extractedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date < now) {
          tags.add('expired');
        } else if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
          tags.add('expires_soon');
        }
      });
    }

    return {
      tags: Array.from(tags),
      confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
      suggestedTags: Array.from(suggestedTags),
      metadata
    };
  }

  private async calculateCategoryScore(
    doc: CustomerDocument,
    category: DocumentCategory
  ): Promise<number> {
    const extractedText = await this.extractTextContent(doc);
    let score = 0;
    let matches = 0;

    // Check keywords
    category.rules.keywords.forEach(keyword => {
      if (extractedText.toLowerCase().includes(keyword.toLowerCase())) {
        matches++;
      }
    });

    // Check patterns
    category.rules.patterns.forEach(pattern => {
      if (pattern.test(extractedText)) {
        matches++;
      }
    });

    // Calculate base score
    score = matches / (category.rules.keywords.length + category.rules.patterns.length);

    // Adjust score based on AI confidence if available
    if (doc.ai_analysis?.category_confidence) {
      score = (score + doc.ai_analysis.category_confidence / 100) / 2;
    }

    return score;
  }

  private async extractTextContent(doc: CustomerDocument): Promise<string> {
    // Simulate text extraction - in a real app, this would use OCR or text extraction APIs
    return `Sample content for ${doc.name}
      This is a ${doc.type} document
      Due date: ${doc.due_date}
      Status: ${doc.status}
      Contains financial information and legal requirements.
      Agreement between parties.
      Total amount: $5000.00
      Document ID: AB123456
      Expires: 2024-12-31`;
  }

  private async extractMetadata(text: string): Promise<{
    extractedDates: string[];
    entities: string[];
    keyPhrases: string[];
  }> {
    // Simulate metadata extraction - in a real app, this would use NLP APIs
    return {
      extractedDates: [
        '2024-12-31',
        '2024-03-15'
      ],
      entities: [
        'Company Name',
        'John Doe',
        'Agreement'
      ],
      keyPhrases: [
        'financial report',
        'legal agreement',
        'confidential information',
        'requires signature'
      ]
    };
  }
}

export const documentClassifier = new DocumentClassifier();