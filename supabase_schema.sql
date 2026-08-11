-- SCHEMA SQL PARA SUPABASE
-- Execute este código no SQL Editor do Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
  number_of_months INT NOT NULL CHECK (number_of_months > 0),
  start_date DATE NOT NULL,
  due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  share_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  month_number INT NOT NULL CHECK (month_number > 0),
  amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0),
  amount_paid NUMERIC(10, 2) DEFAULT 0.00 CHECK (amount_paid >= 0),
  payment_date DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Parcial', 'Pendente', 'Adiantado')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, month_number)
);

CREATE TABLE IF NOT EXISTS party_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
