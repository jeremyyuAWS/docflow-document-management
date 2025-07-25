import { createWorker } from 'tesseract.js';
import natural from 'natural';
import compromise from 'compromise';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-model';
import type { CustomerDocument } from '../types';

const nlp = winkNLP(model);
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

// Enhanced document categories with more specific rules
const documentCategories = {
  financial: {
    keywords: [
      'invoice', 'statement', 'balance', 'payment', 'tax', 'amount',
      'receipt', 'transaction', 'credit', 'debit', 'account', 'bank',
      'finance', 'budget', 'expense', 'revenue', 'profit', 'loss'
    ],
    patterns: [
      /\$\s?\d+(?:\.\d{2})?/,
      /(?:19|20)\d{2}[\/-]\d{1,2}[\/-]\d{1,2}/,
      /Account\s*#?\s*:\s*\d+/i,
      /Invoice\s*#?\s*:\s*\w+/i
    ],
    requiredFields: [
      'amount',
      'date',
      'payee',
      'description',
      'account_number',
      'transaction_type'
    ],
    validations: [
      { type: 'amount_format', pattern: /^\$?\d+(\.\d{2})?$/ },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ },
      { type: 'account_number', pattern: /^\d{8,}$/ }
    ]
  },
  legal: {
    keywords: [
      'contract', 'agreement', 'terms', 'conditions', 'party', 'clause',
      'legal', 'binding', 'jurisdiction', 'warranty', 'liability',
      'confidential', 'termination', 'governing', 'law', 'arbitration'
    ],
    patterns: [
      /party of the (?:first|second) part/i,
      /hereby agrees to/i,
      /terms and conditions/i,
      /IN WITNESS WHEREOF/i,
      /WHEREAS/i
    ],
    requiredFields: [
      'parties',
      'date',
      'terms',
      'signatures',
      'governing_law',
      'effective_date'
    ],
    validations: [
      { type: 'signature_present', pattern: /signature|signed by/i },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ },
      { type: 'party_names', pattern: /between\s+([^,]+)\s+and\s+([^,]+)/i }
    ]
  },
  medical: {
    keywords: [
      'diagnosis', 'treatment', 'prescription', 'patient', 'doctor',
      'hospital', 'clinic', 'symptoms', 'medication', 'dosage',
      'medical', 'health', 'examination', 'report', 'lab', 'test'
    ],
    patterns: [
      /Patient ID:\s*\d+/i,
      /Dr\.\s+[A-Z][a-z]+/,
      /\d+\s*mg|ml/i,
      /Blood Pressure:\s*\d+\/\d+/i
    ],
    requiredFields: [
      'patient_name',
      'patient_id',
      'doctor_name',
      'date',
      'diagnosis',
      'treatment'
    ],
    validations: [
      { type: 'patient_id', pattern: /^\d{6,}$/ },
      { type: 'doctor_name', pattern: /^Dr\.\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/ },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ }
    ]
  },
  employment: {
    keywords: [
      'employment', 'salary', 'position', 'employee', 'employer',
      'compensation', 'benefits', 'duties', 'responsibilities',
      'work', 'job', 'hire', 'termination', 'resignation'
    ],
    patterns: [
      /Employee ID:\s*\d+/i,
      /Annual Salary:\s*\$\d+/i,
      /Start Date:\s*\d{4}-\d{2}-\d{2}/i
    ],
    requiredFields: [
      'employee_name',
      'employee_id',
      'position',
      'salary',
      'start_date',
      'department'
    ],
    validations: [
      { type: 'employee_id', pattern: /^\d{5,}$/ },
      { type: 'salary_format', pattern: /^\$\d+(\.\d{2})?$/ },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ }
    ]
  },
  educational: {
    keywords: [
      'transcript', 'degree', 'certificate', 'academic', 'student',
      'course', 'grade', 'university', 'college', 'school',
      'education', 'graduation', 'diploma', 'qualification'
    ],
    patterns: [
      /Student ID:\s*\d+/i,
      /Grade:\s*[A-F][+-]?/i,
      /GPA:\s*\d+\.\d+/i
    ],
    requiredFields: [
      'student_name',
      'student_id',
      'institution',
      'program',
      'date',
      'grades'
    ],
    validations: [
      { type: 'student_id', pattern: /^\d{7,}$/ },
      { type: 'grade_format', pattern: /^[A-F][+-]?$/ },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ }
    ]
  },
  insurance: {
    keywords: [
      'policy', 'coverage', 'premium', 'claim', 'insurer', 'insured',
      'beneficiary', 'liability', 'deductible', 'insurance',
      'risk', 'underwriting', 'assessment', 'quote'
    ],
    patterns: [
      /Policy #:\s*\w+/i,
      /Coverage Amount:\s*\$\d+/i,
      /Premium:\s*\$\d+/i
    ],
    requiredFields: [
      'policy_number',
      'insured_name',
      'coverage_type',
      'premium_amount',
      'effective_date',
      'expiration_date'
    ],
    validations: [
      { type: 'policy_number', pattern: /^[A-Z0-9]{8,}$/ },
      { type: 'amount_format', pattern: /^\$\d+(\.\d{2})?$/ },
      { type: 'date_format', pattern: /^\d{4}-\d{2}-\d{2}$/ }
    ]
  }
};

// Language support configurations
const languageConfigs = {
  english: {
    worker: 'eng',
    dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
    numberFormat: /^[0-9,.]+$/,
    currencySymbol: '$'
  },
  spanish: {
    worker: 'spa',
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD'],
    numberFormat: /^[0-9,.]+$/,
    currencySymbol: '€'
  },
  french: {
    worker: 'fra',
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD'],
    numberFormat: /^[0-9,.]+$/,
    currencySymbol: '€'
  },
  german: {
    worker: 'deu',
    dateFormats: ['DD.MM.YYYY', 'YYYY-MM-DD'],
    numberFormat: /^[0-9,.]+$/,
    currencySymbol: '€'
  },
  chinese: {
    worker: 'chi_sim',
    dateFormats: ['YYYY年MM月DD日', 'YYYY-MM-DD'],
    numberFormat: /^[0-9,.]+$/,
    currencySymbol: '¥'
  }
};

interface ProcessingResult {
  text: string;
  confidence: number;
  metadata: {
    language: string;
    orientation: number;
    wordCount: number;
    processingTime: number;
    readabilityScore: number;
    complexity: 'low' | 'medium' | 'high';
  };
  entities: {
    dates: string[];
    names: string[];
    organizations: string[];
    locations: string[];
    amounts: string[];
  };
  classification: {
    category: string;
    confidence: number;
    keywords: string[];
    summary: string;
  };
  validation: {
    isValid: boolean;
    issues: string[];
    requiredFields: {
      name: string;
      found: boolean;
      value?: string;
    }[];
    completeness: number;
  };
  analysis: {
    sentiment: number;
    urgency: number;
    keyPhrases: string[];
    topics: string[];
    relationships: Array<{
      entity1: string;
      relationship: string;
      entity2: string;
    }>;
  };
}

class DocumentProcessor {
  private worker: Tesseract.Worker | null = null;
  private language: string = 'english';
  private customModels: Map<string, any> = new Map();

  async initialize(language: string = 'english') {
    this.language = language;
    if (!this.worker) {
      this.worker = await createWorker(languageConfigs[language].worker);
    }
  }

  async processDocument(file: File, options: {
    language?: string;
    category?: string;
    customValidations?: any[];
  } = {}): Promise<ProcessingResult> {
    await this.initialize(options.language);
    const startTime = Date.now();

    // Extract text using OCR with language support
    const { data } = await this.worker!.recognize(file);
    const text = data.text;

    // Process with NLP using language-specific models
    const doc = nlp.readDoc(text);
    const tokens = tokenizer.tokenize(text);

    // Apply custom NLP model if available
    if (options.category && this.customModels.has(options.category)) {
      const customModel = this.customModels.get(options.category);
      // Apply custom model processing here
    }

    // Extract entities with enhanced NLP
    const entities = this.extractEntities(doc, text);
    
    // Classify document
    const classification = this.classifyDocument(text, tokens, options.category);
    
    // Validate document with enhanced rules
    const validation = this.validateDocument(text, classification.category, options.customValidations);
    
    // Analyze content
    const analysis = this.analyzeContent(doc, text);

    // Calculate readability
    const readabilityScore = this.calculateReadabilityScore(text);

    const result: ProcessingResult = {
      text,
      confidence: data.confidence,
      metadata: {
        language: data.language,
        orientation: data.orientation,
        wordCount: tokens.length,
        processingTime: Date.now() - startTime,
        readabilityScore,
        complexity: this.determineComplexity(readabilityScore)
      },
      entities,
      classification,
      validation,
      analysis
    };

    return result;
  }

  // Add custom NLP model for specific document types
  async addCustomModel(category: string, model: any) {
    this.customModels.set(category, model);
  }

  private extractEntities(doc: any, text: string) {
    const entities = {
      dates: [] as string[],
      names: [] as string[],
      organizations: [] as string[],
      locations: [] as string[],
      amounts: [] as string[]
    };

    // Extract dates
    const datePatterns = [
      /\d{4}-\d{2}-\d{2}/g,
      /\d{2}\/\d{2}\/\d{4}/g,
      /\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}/gi
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.dates.push(...matches);
      }
    });

    // Extract names and organizations using compromise
    const compromiseDoc = compromise(text);
    entities.names = compromiseDoc.people().out('array');
    entities.organizations = compromiseDoc.organizations().out('array');
    
    // Extract locations
    entities.locations = compromiseDoc.places().out('array');

    // Extract monetary amounts
    const amountPattern = /\$\s?\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s?(?:USD|EUR|GBP)/g;
    const amounts = text.match(amountPattern);
    if (amounts) {
      entities.amounts = amounts;
    }

    return entities;
  }

  private classifyDocument(text: string, tokens: string[], category?: string): ProcessingResult['classification'] {
    let bestCategory = category || '';
    let bestScore = 0;
    const keywords = new Set<string>();

    // Add document text to TF-IDF
    tfidf.addDocument(tokens);

    // Calculate scores for each category
    Object.entries(documentCategories).forEach(([cat, config]) => {
      if (category && cat !== category) return;

      let score = 0;
      config.keywords.forEach(keyword => {
        const tfidfScore = tfidf.tfidf(keyword, 0);
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          keywords.add(keyword);
          score += tfidfScore;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    });

    // Generate summary using text rank algorithm
    const summary = this.generateSummary(text);

    return {
      category: bestCategory,
      confidence: Math.min(bestScore / 5, 1) * 100,
      keywords: Array.from(keywords),
      summary
    };
  }

  private validateDocument(text: string, category: string, customValidations?: any[]): ProcessingResult['validation'] {
    const validation = {
      isValid: true,
      issues: [] as string[],
      requiredFields: [] as { name: string; found: boolean; value?: string }[],
      completeness: 0
    };

    const categoryConfig = documentCategories[category];
    if (!categoryConfig) return validation;

    let foundFields = 0;
    const totalFields = categoryConfig.requiredFields.length;

    categoryConfig.requiredFields.forEach(field => {
      const fieldResult = this.findField(text, field, categoryConfig.patterns);
      validation.requiredFields.push({
        name: field,
        found: fieldResult.found,
        value: fieldResult.value
      });

      if (!fieldResult.found) {
        validation.issues.push(`Missing required field: ${field}`);
      } else {
        foundFields++;
      }
    });

    // Apply custom validations if provided
    if (customValidations) {
      customValidations.forEach(customValidation => {
        const validationResult = this.applyCustomValidation(text, customValidation);
        if (!validationResult.valid) {
          validation.issues.push(validationResult.issue);
        }
      });
    }

    validation.completeness = (foundFields / totalFields) * 100;
    validation.isValid = validation.issues.length === 0;

    return validation;
  }

  private findField(text: string, field: string, patterns: RegExp[]): { found: boolean; value?: string } {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { found: true, value: match[0] };
      }
    }
    return { found: false };
  }

  private applyCustomValidation(text: string, validation: any): { valid: boolean; issue?: string } {
    // Implement custom validation logic
    return { valid: true };
  }

  private analyzeContent(doc: any, text: string): ProcessingResult['analysis'] {
    // Extract key phrases using TextRank algorithm
    const keyPhrases = this.extractKeyPhrases(text);

    // Calculate sentiment using multiple approaches
    const sentiment = this.calculateSentiment(text);

    // Determine urgency based on keywords and patterns
    const urgency = this.calculateUrgency(text);

    // Extract topics using LDA-like approach
    const topics = this.extractTopics(text);

    // Find relationships between entities
    const relationships = this.findRelationships(doc);

    return {
      sentiment,
      urgency,
      keyPhrases,
      topics,
      relationships
    };
  }

  private calculateReadabilityScore(text: string): number {
    // Implement Flesch-Kincaid readability score
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);
    
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  }

  private countSyllables(text: string): number {
    return text.split(/\s+/).reduce((count, word) => {
      return count + (word.match(/[aeiou]/gi)?.length || 1);
    }, 0);
  }

  private determineComplexity(readabilityScore: number): 'low' | 'medium' | 'high' {
    if (readabilityScore > 80) return 'low';
    if (readabilityScore > 60) return 'medium';
    return 'high';
  }

  private generateSummary(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const rankedSentences = sentences
      .map((sentence, index) => ({
        sentence,
        score: this.calculateSentenceImportance(sentence, sentences)
      }))
      .sort((a, b) => b.score - a.score);

    return rankedSentences
      .slice(0, 3)
      .map(s => s.sentence)
      .join('. ');
  }

  private calculateSentenceImportance(sentence: string, allSentences: string[]): number {
    const words = sentence.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      score += tfidf.tfidf(word, 0);
    });

    return score / words.length;
  }

  private extractKeyPhrases(text: string): string[] {
    const doc = compromise(text);
    return doc.topics().out('array');
  }

  private calculateSentiment(text: string): number {
    const doc = compromise(text);
    const positive = doc.match('#Positive').length;
    const negative = doc.match('#Negative').length;
    return (positive - negative) / (positive + negative + 1);
  }

  private calculateUrgency(text: string): number {
    const urgentTerms = ['urgent', 'asap', 'immediately', 'deadline', 'critical'];
    const matches = urgentTerms.filter(term => text.toLowerCase().includes(term));
    return matches.length / urgentTerms.length;
  }

  private extractTopics(text: string): string[] {
    const doc = compromise(text);
    return doc.nouns().out('array');
  }

  private findRelationships(doc: any): ProcessingResult['analysis']['relationships'] {
    return [];
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const documentProcessor = new DocumentProcessor();