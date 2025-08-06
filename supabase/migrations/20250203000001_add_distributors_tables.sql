-- Create distributors table
CREATE TABLE IF NOT EXISTS distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company_type TEXT NOT NULL DEFAULT 'distributor',
    tax_info JSONB NOT NULL DEFAULT '{}',
    email TEXT,
    phone TEXT,
    website TEXT,
    address JSONB DEFAULT '{}',
    assigned_products_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create product_distributors table
CREATE TABLE IF NOT EXISTS product_distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active',
    territory TEXT,
    commission_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_product_distributor UNIQUE (product_id, distributor_id)
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_distributors_name ON distributors(name);
CREATE INDEX IF NOT EXISTS idx_product_distributors_product ON product_distributors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_distributors_distributor ON product_distributors(distributor_id);

-- Enable RLS
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_distributors ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_distributors_updated_at
    BEFORE UPDATE ON distributors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_distributors_updated_at
    BEFORE UPDATE ON product_distributors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Basic policies
CREATE POLICY "Allow all users to view distributors" ON distributors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage distributors" ON distributors FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their company's product distributors" ON product_distributors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage product distributors" ON product_distributors FOR ALL USING (auth.role() = 'authenticated'); 