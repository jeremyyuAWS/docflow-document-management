import { CustomerDocument } from '../types';

export interface ValidationResult {
  passed: boolean;
  type: string;
  size: number;
  format: string;
  issues: string[];
  confidence: number;
  extractedData?: {
    title?: string;
    date?: string;
    category?: string;
  };
}

export async function validateDocument(file: File): Promise<ValidationResult> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const issues: string[] = [];
  
  // Check file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    issues.push('Invalid file type. Only PDF and Word documents are allowed.');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    issues.push('File size exceeds 10MB limit.');
  }

  // Randomly determine if the document is valid (50% chance)
  const isValid = Math.random() >= 0.5;

  if (!isValid) {
    issues.push(...[
      'Document appears to be corrupted or unreadable',
      'Invalid document structure detected',
      'Missing required metadata'
    ]);
  }

  // Random confidence score
  const randomConfidence = isValid ? 
    Math.floor(Math.random() * 20) + 80 : // 80-100 for valid docs
    Math.floor(Math.random() * 30) + 20;  // 20-50 for invalid docs

  // Mock extracted data
  const extractedData = isValid ? {
    title: file.name.split('.')[0],
    date: new Date().toISOString().split('T')[0],
    category: ['Invoice', 'Contract', 'Report', 'ID Document'][Math.floor(Math.random() * 4)]
  } : undefined;

  return {
    passed: isValid && issues.length === 0,
    type: file.type,
    size: file.size,
    format: file.type.split('/')[1].toUpperCase(),
    issues,
    confidence: randomConfidence,
    extractedData
  };
}

export function analyzeDocumentContent(doc: CustomerDocument) {
  return {
    sentiment: Math.random(),
    priority: Math.floor(Math.random() * 10),
    category: ['Financial', 'Legal', 'Personal', 'Business'][Math.floor(Math.random() * 4)],
    nextActions: [
      'Review document',
      'Request signature',
      'Schedule follow-up',
      'Archive document'
    ].slice(0, Math.floor(Math.random() * 3) + 1)
  };
}

export function generateDocumentInsights(doc: CustomerDocument) {
  const analysis = analyzeDocumentContent(doc);
  
  return {
    riskLevel: analysis.priority > 7 ? 'High' : analysis.priority > 4 ? 'Medium' : 'Low',
    suggestedActions: analysis.nextActions,
    category: analysis.category,
    confidence: Math.random() * 100
  };
}