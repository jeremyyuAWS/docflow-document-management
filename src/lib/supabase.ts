import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_contact_method: string;
  engagement_score: number;
}

export interface Document {
  id: string;
  customer_id: string;
  type: string;
  name: string;
  status: 'pending' | 'received' | 'overdue';
  due_date: string;
  ai_confidence_score: number;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  document_id: string;
  channel: 'email' | 'whatsapp';
  scheduled_time: string;
  message_template: string;
  status: string;
  ai_suggested_time: string;
}