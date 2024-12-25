/*
  # Create DPPs Table

  1. New Tables
    - `dpps`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `serial_number` (text, unique)
      - `manufacturing_date` (date)
      - `manufacturing_facility` (text)
      - `qr_code` (text)
      - `template_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `dpps` table
    - Add policies for company-specific access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create DPPs table
CREATE TABLE dpps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    serial_number TEXT NOT NULL UNIQUE,
    manufacturing_date DATE NOT NULL,
    manufacturing_facility TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    template_id UUID NOT NULL REFERENCES dpp_templates(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_dpps_product ON dpps(product_id);
CREATE INDEX idx_dpps_serial ON dpps(serial_number);
CREATE INDEX idx_dpps_template ON dpps(template_id);

-- Enable Row Level Security
ALTER TABLE dpps ENABLE ROW LEVEL SECURITY;

-- Create policy for company access
CREATE POLICY "Users can access their company's DPPs"
    ON dpps
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = dpps.product_id
            AND p.company_id = auth.uid()
        )
    );

-- Update timestamp trigger
CREATE TRIGGER update_dpps_updated_at
    BEFORE UPDATE ON dpps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();