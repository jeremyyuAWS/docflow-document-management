/*
  # Initial Schema Setup

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `preferred_contact_method` (text)
      - `created_at` (timestamptz)
      - `last_contact` (timestamptz)
      - `engagement_score` (double precision)

    - `documents`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `type` (text)
      - `name` (text)
      - `status` (text)
      - `due_date` (date)
      - `reminder_count` (integer)
      - `ai_confidence_score` (double precision)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `follow_ups`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `document_id` (uuid, foreign key)
      - `channel` (text)
      - `scheduled_time` (timestamptz)
      - `message_template` (text)
      - `status` (text)
      - `ai_suggested_time` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create customers table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    preferred_contact_method text DEFAULT 'email'::text,
    created_at timestamptz DEFAULT now(),
    last_contact timestamptz,
    engagement_score double precision DEFAULT 0
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policy for customers if it doesn't exist
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all access for authenticated users" ON customers;
  CREATE POLICY "Allow all access for authenticated users"
    ON customers
    TO authenticated
    USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create documents table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES customers(id),
    type text NOT NULL,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    due_date date NOT NULL,
    reminder_count integer DEFAULT 0,
    ai_confidence_score double precision,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policy for documents if it doesn't exist
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all access for authenticated users" ON documents;
  CREATE POLICY "Allow all access for authenticated users"
    ON documents
    TO authenticated
    USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create follow_ups table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS follow_ups (
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policy for follow_ups if it doesn't exist
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all access for authenticated users" ON follow_ups;
  CREATE POLICY "Allow all access for authenticated users"
    ON follow_ups
    TO authenticated
    USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;