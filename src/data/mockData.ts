import { Customer, CustomerDocument } from '../types';
import { format, addDays, subDays } from 'date-fns';

const companies = [
  'TechCorp Solutions', 'Global Innovations', 'DataFlow Systems',
  'Smart Analytics', 'Cloud Nine Technologies', 'Future Dynamics',
  'Quantum Industries', 'Digital Frontiers', 'Apex Solutions',
  'Stellar Systems'
];

const documentTypes = [
  'W-9 Form', 'Business License', 'Insurance Certificate',
  'Bank Statements', 'Financial Statements', 'Tax Returns',
  'Identity Verification', 'Proof of Address', 'Employment Contract',
  'Company Registration'
];

const generateCustomer = (id: number): Customer => {
  const pending = Math.floor(Math.random() * 5);
  const completed = Math.floor(Math.random() * 8);
  const sources = ['Hubspot', 'Salesforce', 'Zoho'] as const;
  
  return {
    id: `CUST-${id.toString().padStart(5, '0')}`,
    full_name: [
      'Emma Thompson', 'James Wilson', 'Sarah Chen', 'Michael Rodriguez',
      'Lisa Patel', 'David Kim', 'Rachel O\'Connor', 'Carlos Santos',
      'Anna Kowalski', 'John Smith', 'Maria Garcia', 'Ahmed Hassan',
      'Sophie Martin', 'Ryan Johnson', 'Yuki Tanaka', 'Oliver Brown',
      'Priya Sharma', 'Thomas Anderson', 'Isabella Silva', 'William Lee',
      'Fatima Al-Sayed', 'Daniel Murphy', 'Elena Popov', 'Marcus Wong',
      'Laura Martinez'
    ][id % 25],
    email: `contact${id}@${companies[id % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    source: sources[id % sources.length],
    company: companies[id % companies.length],
    role: ['CEO', 'CFO', 'CTO', 'Director', 'Manager', 'Team Lead'][Math.floor(Math.random() * 6)],
    last_contact: format(subDays(new Date(), Math.floor(Math.random() * 14)), 'yyyy-MM-dd'),
    engagement_score: Math.floor(Math.random() * 100),
    documents_pending: pending,
    documents_completed: completed,
    next_follow_up: Math.random() > 0.3 ? format(addDays(new Date(), Math.floor(Math.random() * 7)), 'yyyy-MM-dd') : null,
    ai_suggestions: {
      best_contact_time: ['Morning (9-11 AM)', 'Afternoon (2-4 PM)', 'Evening (4-6 PM)'][Math.floor(Math.random() * 3)],
      engagement_tips: [
        'Previous responses indicate preference for detailed technical information',
        'Quick to respond to morning emails',
        'Prefers brief, bullet-pointed updates',
        'Shows higher engagement with visual content',
        'Responds well to deadline reminders'
      ][Math.floor(Math.random() * 5)],
      priority_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low'
    }
  };
};

const generateDocuments = (customerId: string): CustomerDocument[] => {
  const count = Math.floor(Math.random() * 5) + 1;
  return Array.from({ length: count }, (_, i) => {
    const doc: CustomerDocument = {
      id: `DOC-${customerId}-${i}`,
      name: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      type: ['Identity', 'Financial', 'Legal', 'Business'][Math.floor(Math.random() * 4)],
      status: ['pending', 'received', 'overdue'][Math.floor(Math.random() * 3)] as 'pending' | 'received' | 'overdue',
      due_date: format(addDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      last_reminder: format(subDays(new Date(), Math.floor(Math.random() * 7)), 'yyyy-MM-dd'),
      ai_urgency_score: Math.random() * 100,
      ai_analysis: {
        sentiment_score: Math.random(),
        category_confidence: Math.random() * 100,
        predicted_completion_date: format(addDays(new Date(), Math.floor(Math.random() * 14)), 'yyyy-MM-dd'),
        risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
        key_insights: [
          'Document requires immediate attention',
          'Similar to previously completed documents',
          'May need additional verification',
          'Complex requirements detected'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        suggested_actions: [
          'Send follow-up reminder',
          'Schedule review meeting',
          'Request additional information',
          'Escalate to supervisor'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    };
    return doc;
  });
};

export const mockCustomers = Array.from({ length: 25 }, (_, i) => generateCustomer(i));
export const mockDocuments = mockCustomers.reduce((acc, customer) => {
  acc[customer.id] = generateDocuments(customer.id);
  return acc;
}, {} as Record<string, CustomerDocument[]>);