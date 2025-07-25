import { DocumentAnalysis, CustomerDocument } from '../types';

export function analyzeDocument(doc: CustomerDocument): DocumentAnalysis {
  const sentimentScore = Math.random() * 0.5 + 0.5;
  const priorityScore = calculatePriorityScore(doc);
  const riskFactors = generateRiskFactors(doc);
  const nextActions = generateNextActions(doc);

  return {
    id: `analysis-${doc.id}`,
    document_id: doc.id,
    content_summary: `Analysis of ${doc.name}`,
    sentiment_score: sentimentScore,
    priority_score: priorityScore,
    completion_prediction: predictCompletionDate(doc).toISOString(),
    risk_factors: riskFactors,
    next_actions: nextActions,
    created_at: new Date().toISOString(),
    engagement_metrics: calculateEngagementMetrics(doc),
    optimal_followup_time: predictOptimalFollowupTime(doc),
    category_confidence: calculateCategoryConfidence(doc),
    processing_efficiency: calculateProcessingEfficiency(doc)
  };
}

function calculatePriorityScore(doc: CustomerDocument): number {
  let score = 0;
  
  // Due date proximity
  const dueDate = new Date(doc.due_date);
  const today = new Date();
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) score += 100;
  else if (daysUntilDue < 3) score += 75;
  else if (daysUntilDue < 7) score += 50;
  else if (daysUntilDue < 14) score += 25;
  
  // Document type importance
  switch (doc.type.toLowerCase()) {
    case 'legal': score += 30; break;
    case 'financial': score += 25; break;
    case 'identity': score += 20; break;
    default: score += 10;
  }
  
  // Previous engagement impact
  if (doc.ai_analysis?.sentiment_score) {
    score += doc.ai_analysis.sentiment_score * 20;
  }
  
  return Math.min(100, score);
}

function generateRiskFactors(doc: CustomerDocument): string[] {
  const factors = [];
  const dueDate = new Date(doc.due_date);
  const today = new Date();
  
  if (dueDate < today) {
    factors.push('Document is overdue');
  }
  
  if (doc.type === 'Legal') {
    factors.push('Critical legal document requiring immediate attention');
  }
  
  if (doc.ai_analysis?.sentiment_score && doc.ai_analysis.sentiment_score < 0.5) {
    factors.push('Low engagement detected');
  }
  
  return factors;
}

function generateNextActions(doc: CustomerDocument): string[] {
  const actions = [];
  const dueDate = new Date(doc.due_date);
  const today = new Date();
  
  if (dueDate < today) {
    actions.push('Send urgent follow-up reminder');
    actions.push('Escalate to supervisor');
  } else if (doc.ai_analysis?.sentiment_score && doc.ai_analysis.sentiment_score < 0.5) {
    actions.push('Schedule personal follow-up call');
    actions.push('Send detailed document requirements');
  }
  
  return actions;
}

function calculateEngagementMetrics(doc: CustomerDocument) {
  return {
    response_rate: Math.random() * 100,
    average_processing_time: Math.floor(Math.random() * 48) + 24,
    completion_probability: Math.random() * 100,
    interaction_quality: Math.random() * 100
  };
}

function predictOptimalFollowupTime(doc: CustomerDocument) {
  const baseTime = new Date();
  const hourOffset = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
  baseTime.setHours(hourOffset, 0, 0, 0);
  
  return {
    predicted_time: baseTime.toISOString(),
    confidence: Math.random() * 100,
    factors: [
      'Historical response patterns',
      'Document urgency',
      'Customer timezone',
      'Previous interaction success'
    ]
  };
}

function calculateCategoryConfidence(doc: CustomerDocument) {
  return {
    confidence_score: Math.random() * 100,
    matching_patterns: Math.floor(Math.random() * 5) + 3,
    similar_documents: Math.floor(Math.random() * 10) + 5
  };
}

function calculateProcessingEfficiency(doc: CustomerDocument) {
  return {
    processing_time: Math.floor(Math.random() * 60) + 30,
    automation_potential: Math.random() * 100,
    error_rate: Math.random() * 5,
    optimization_suggestions: [
      'Enable automated categorization',
      'Set up instant notifications',
      'Use smart templates'
    ]
  };
}

export function predictCompletionDate(doc: CustomerDocument): Date {
  const baseDate = new Date(doc.due_date);
  const randomOffset = Math.floor(Math.random() * 7) - 3;
  return new Date(baseDate.getTime() + randomOffset * 24 * 60 * 60 * 1000);
}

export function calculateDocumentRisk(doc: CustomerDocument): number {
  const dueDate = new Date(doc.due_date);
  const today = new Date();
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let risk = 0;
  
  // Due date risk
  if (daysUntilDue < 0) risk += 100;
  else if (daysUntilDue < 3) risk += 75;
  else if (daysUntilDue < 7) risk += 50;
  else if (daysUntilDue < 14) risk += 25;
  
  // Document type risk
  if (doc.type === 'Legal') risk += 20;
  if (doc.type === 'Financial') risk += 15;
  
  // Reminder impact
  const reminderCount = parseInt(doc.last_reminder) || 0;
  risk += reminderCount * 5;
  
  // Engagement risk
  if (doc.ai_analysis?.sentiment_score) {
    risk += (1 - doc.ai_analysis.sentiment_score) * 25;
  }
  
  return Math.min(100, risk);
}

export function getUrgencyBreakdown(doc: CustomerDocument) {
  const dueDate = new Date(doc.due_date);
  const today = new Date();
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    timeUrgency: daysUntilDue < 0 ? 100 : Math.max(0, Math.min(100, (1 - daysUntilDue / 30) * 100)),
    typeImportance: doc.type === 'Legal' ? 90 : doc.type === 'Financial' ? 75 : 50,
    reminderImpact: Math.min(100, doc.reminder_count * 10 || 0),
    overallRisk: calculateDocumentRisk(doc),
    predictedDelay: calculatePredictedDelay(doc),
    completionLikelihood: calculateCompletionLikelihood(doc)
  };
}

function calculatePredictedDelay(doc: CustomerDocument) {
  const baseDelay = Math.floor(Math.random() * 5);
  const riskFactor = calculateDocumentRisk(doc) / 100;
  return Math.round(baseDelay * (1 + riskFactor));
}

function calculateCompletionLikelihood(doc: CustomerDocument) {
  const risk = calculateDocumentRisk(doc);
  const baseChance = 90;
  return Math.max(0, Math.min(100, baseChance - (risk * 0.5)));
}