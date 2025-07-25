import { CustomerDocument } from '../types';

interface CustomModel {
  name: string;
  version: string;
  category: string;
  features: string[];
  weights: Record<string, number>;
  patterns: RegExp[];
  rules: Array<{
    condition: (text: string) => boolean;
    action: (text: string) => any;
  }>;
}

// Custom NLP model for financial documents
export const financialModel: CustomModel = {
  name: 'Financial Document Analyzer',
  version: '1.0.0',
  category: 'financial',
  features: ['amounts', 'dates', 'account_numbers', 'transaction_types'],
  weights: {
    amount_presence: 0.3,
    date_format: 0.2,
    account_validation: 0.3,
    transaction_classification: 0.2
  },
  patterns: [
    /\$\s?\d+(?:\.\d{2})?/,
    /(?:19|20)\d{2}[\/-]\d{1,2}[\/-]\d{1,2}/,
    /Account\s*#?\s*:\s*\d+/i,
    /Transaction\s*ID\s*:\s*\w+/i
  ],
  rules: [
    {
      condition: (text: string) => /total|amount|sum/i.test(text),
      action: (text: string) => {
        const matches = text.match(/\$\s?\d+(?:\.\d{2})?/g);
        return matches ? matches.map(m => parseFloat(m.replace('$', ''))) : [];
      }
    },
    {
      condition: (text: string) => /account|acct/i.test(text),
      action: (text: string) => {
        const matches = text.match(/\d{8,}/g);
        return matches || [];
      }
    }
  ]
};

// Custom NLP model for legal documents
export const legalModel: CustomModel = {
  name: 'Legal Document Analyzer',
  version: '1.0.0',
  category: 'legal',
  features: ['parties', 'clauses', 'signatures', 'dates'],
  weights: {
    party_identification: 0.25,
    clause_analysis: 0.25,
    signature_verification: 0.25,
    date_validation: 0.25
  },
  patterns: [
    /party of the (?:first|second) part/i,
    /hereby agrees to/i,
    /IN WITNESS WHEREOF/i,
    /WHEREAS/i
  ],
  rules: [
    {
      condition: (text: string) => /between|party|parties/i.test(text),
      action: (text: string) => {
        const matches = text.match(/between\s+([^,]+)\s+and\s+([^,]+)/i);
        return matches ? [matches[1], matches[2]] : [];
      }
    },
    {
      condition: (text: string) => /signature|signed|executed/i.test(text),
      action: (text: string) => {
        return /signature|signed by|executed by/i.test(text);
      }
    }
  ]
};

// Custom NLP model for medical documents
export const medicalModel: CustomModel = {
  name: 'Medical Document Analyzer',
  version: '1.0.0',
  category: 'medical',
  features: ['diagnoses', 'medications', 'procedures', 'vitals'],
  weights: {
    diagnosis_identification: 0.3,
    medication_analysis: 0.3,
    procedure_validation: 0.2,
    vital_signs: 0.2
  },
  patterns: [
    /Patient ID:\s*\d+/i,
    /Dr\.\s+[A-Z][a-z]+/,
    /\d+\s*mg|ml/i,
    /Blood Pressure:\s*\d+\/\d+/i
  ],
  rules: [
    {
      condition: (text: string) => /diagnosis|assessment/i.test(text),
      action: (text: string) => {
        const matches = text.match(/(?:diagnosis|assessment):\s*([^\n.]+)/i);
        return matches ? matches[1] : null;
      }
    },
    {
      condition: (text: string) => /medication|prescribe/i.test(text),
      action: (text: string) => {
        const matches = text.match(/\d+\s*(?:mg|ml)\s+[A-Za-z]+/g);
        return matches || [];
      }
    }
  ]
};

// Model registry for easy access and management
export const modelRegistry = new Map<string, CustomModel>([
  ['financial', financialModel],
  ['legal', legalModel],
  ['medical', medicalModel]
]);

// Helper function to apply custom model to document
export function applyCustomModel(document: CustomerDocument, model: CustomModel) {
  const results = {
    features: {} as Record<string, any>,
    confidence: 0,
    extracted: {} as Record<string, any>
  };

  // Apply model rules
  model.rules.forEach(rule => {
    if (rule.condition(document.name)) {
      results.extracted[model.name] = rule.action(document.name);
    }
  });

  // Calculate confidence score
  let totalScore = 0;
  Object.entries(model.weights).forEach(([feature, weight]) => {
    const featurePresent = model.patterns.some(pattern => 
      pattern.test(document.name)
    );
    totalScore += featurePresent ? weight : 0;
  });

  results.confidence = totalScore;

  return results;
}