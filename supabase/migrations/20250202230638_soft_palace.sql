/*
  # Add Company Suppliers Table

  1. New Tables
    - `company_suppliers`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `supplier_id` (uuid, foreign key to companies)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on `company_suppliers` table
    - Add policies for authenticated users

  3. Changes
    - Add foreign key constraints
    - Add indexes for performance
    - Add trigger for updated_at
*/

-- Create company_suppliers table
CREATE TABLE IF NOT EXISTS company_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    supplier_id UUID NOT NULL REFERENCES companies(id),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'pending')),
    CONSTRAINT unique_company_supplier UNIQUE (company_id, supplier_id)
);

-- Create indexes
CREATE INDEX idx_company_suppliers_company ON company_suppliers(company_id);
CREATE INDEX idx_company_suppliers_supplier ON company_suppliers(supplier_id);
CREATE INDEX idx_company_suppliers_status ON company_suppliers(status);

-- Enable Row Level Security
ALTER TABLE company_suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own company's suppliers"
    ON company_suppliers
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM companies WHERE id = company_id
    ));

CREATE POLICY "Users can manage their own company's suppliers"
    ON company_suppliers
    FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM companies WHERE id = company_id
    ));

-- Create updated_at trigger
CREATE TRIGGER update_company_suppliers_updated_at
    BEFORE UPDATE ON company_suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to automatically add supplier relationship when a product is created
CREATE OR REPLACE FUNCTION add_supplier_relationship()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if manufacturer_id is different from company_id
    IF NEW.manufacturer_id != NEW.company_id THEN
        -- Insert supplier relationship if it doesn't exist
        INSERT INTO company_suppliers (company_id, supplier_id)
        VALUES (NEW.company_id, NEW.manufacturer_id)
        ON CONFLICT (company_id, supplier_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add supplier relationship
CREATE TRIGGER add_supplier_on_product_create
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION add_supplier_relationship();

-- Add comment explaining the table
COMMENT ON TABLE company_suppliers IS 'Tracks relationships between companies and their suppliers';

-- Add product_subcategory column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_subcategory TEXT NULL;