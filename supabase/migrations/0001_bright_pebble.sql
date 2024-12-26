/*
  # Add DPP Tables

  1. New Tables
    - `dpp_templates` - Stores DPP template configurations
    - `dpps` - Stores Digital Product Passports

  2. Security
    - Enable RLS on both tables
    - Add policies for company access
*/

-- Create DPP Templates table
CREATE TABLE IF NOT EXISTS dpp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type VARCHAR(50) NOT NULL,
    hazard_pictograms JSONB NOT NULL DEFAULT '[]',
    materials JSONB NOT NULL DEFAULT '[]',
    health_safety_measures JSONB NOT NULL DEFAULT '[]',
    emergency_procedures JSONB NOT NULL DEFAULT '[]',
    storage_installation_guidelines JSONB NOT NULL DEFAULT '[]',
    required_certifications JSONB NOT NULL DEFAULT '[]',
    optional_certifications JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create DPPs table
CREATE TABLE IF NOT EXISTS dpps (
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
CREATE INDEX idx_dpp_templates_type ON dpp_templates(product_type);
CREATE INDEX idx_dpps_product ON dpps(product_id);
CREATE INDEX idx_dpps_serial ON dpps(serial_number);
CREATE INDEX idx_dpps_template ON dpps(template_id);

-- Enable Row Level Security
ALTER TABLE dpp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpps ENABLE ROW LEVEL SECURITY;

-- Create policies for DPP Templates
CREATE POLICY "Users can read DPP templates"
    ON dpp_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for DPPs company access
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

-- Update timestamp triggers
CREATE TRIGGER update_dpp_templates_updated_at
    BEFORE UPDATE ON dpp_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dpps_updated_at
    BEFORE UPDATE ON dpps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();