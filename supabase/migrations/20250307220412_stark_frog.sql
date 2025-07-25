/*
  # Initial Schema Setup for Document Collection System

  1. New Tables
    - customers
      - Basic customer information
      - Contact preferences
    - documents
      - Document metadata
      - Status tracking
      - AI analysis results
    - follow_ups
      - Communication history
      - Scheduled follow-ups
      - AI-suggested timing

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  preferred_contact_method text DEFAULT 'email',
  created_at timestamptz DEFAULT now(),
  last_contact timestamptz,
  engagement_score float DEFAULT 0
);

-- Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  type text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  reminder_count int DEFAULT 0,
  ai_confidence_score float,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  document_id uuid REFERENCES documents(id),
  channel text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  message_template text,
  status text DEFAULT 'pending',
  ai_suggested_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all access for authenticated users" ON customers
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow all access for authenticated users" ON documents
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow all access for authenticated users" ON follow_ups
  FOR ALL TO authenticated
  USING (true);

-- Insert demo data
INSERT INTO customers (id, full_name, email, phone, preferred_contact_method, engagement_score) VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Sarah Johnson', 'sarah.j@example.com', '+1 (555) 123-4567', 'email', 0.85),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Michael Chen', 'michael.c@example.com', '+1 (555) 234-5678', 'whatsapp', 0.65),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Emma Rodriguez', 'emma.r@example.com', '+1 (555) 345-6789', 'email', 0.92);

INSERT INTO documents (customer_id, type, name, status, due_date, ai_confidence_score) VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'ID', 'Driver''s License', 'pending', CURRENT_DATE + INTERVAL '7 days', 0.95),
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'PROOF_OF_ADDRESS', 'Utility Bill', 'received', CURRENT_DATE - INTERVAL '2 days', 0.88),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'INSURANCE', 'Health Insurance Card', 'overdue', CURRENT_DATE - INTERVAL '5 days', 0.78),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'TAX_FORM', 'W-2 Form', 'pending', CURRENT_DATE + INTERVAL '10 days', 0.91);

INSERT INTO follow_ups (customer_id, document_id, channel, scheduled_time, message_template, ai_suggested_time) VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', (SELECT id FROM documents WHERE customer_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851' AND type = 'ID'), 'email', CURRENT_TIMESTAMP + INTERVAL '1 day', 'Hi {customer_name}, just a friendly reminder about your driver''s license submission due on {due_date}.', CURRENT_TIMESTAMP + INTERVAL '2 days'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', (SELECT id FROM documents WHERE customer_id = 'd290f1ee-6c54-4b01-90e6-d701748f0852'), 'whatsapp', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'Hello {customer_name}, your insurance card document is now overdue. Please submit it as soon as possible.', CURRENT_TIMESTAMP + INTERVAL '1 day');