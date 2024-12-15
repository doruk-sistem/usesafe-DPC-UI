-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID NOT NULL REFERENCES companies(id),
    product_type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    status_history JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    key_features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'NEW', 'DELETED', 'ARCHIVED'))
);

-- Create indexes with corrected column names
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_status ON products(status);

-- Create function to validate JSON structure
CREATE OR REPLACE FUNCTION validate_product_json()
RETURNS TRIGGER AS $$
DECLARE
    elem JSONB;
BEGIN
    -- Validate images JSON structure
    IF NEW.images IS NOT NULL THEN
        IF jsonb_typeof(NEW.images) != 'array' THEN
            RAISE EXCEPTION 'images must be an array';
        END IF;
        
        FOR elem IN 
            SELECT jsonb_array_elements(NEW.images)
        LOOP
            IF elem->>'url' IS NULL OR 
               elem->>'alt' IS NULL OR 
               elem->>'is_primary' IS NULL OR
               jsonb_typeof(elem->'is_primary') != 'boolean' THEN
                RAISE EXCEPTION 'Invalid image structure';
            END IF;
        END LOOP;
    END IF;

    -- Validate key_features JSON structure
    IF NEW.key_features IS NOT NULL THEN
        IF jsonb_typeof(NEW.key_features) != 'array' THEN
            RAISE EXCEPTION 'key_features must be an array';
        END IF;
        
        FOR elem IN 
            SELECT jsonb_array_elements(NEW.key_features)
        LOOP
            IF elem->>'name' IS NULL OR 
               elem->>'value' IS NULL OR
               (elem->>'unit' IS NOT NULL AND jsonb_typeof(elem->'unit') != 'string') THEN
                RAISE EXCEPTION 'Invalid key_feature structure';
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for JSON validation
CREATE TRIGGER validate_product_json_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_product_json();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp update
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate status transitions
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow initial status setting
    IF OLD.status IS NULL THEN
        RETURN NEW;
    END IF;

    -- Validate transitions
    IF NOT (
        (OLD.status = 'DRAFT' AND NEW.status IN ('NEW', 'DELETED')) OR
        (OLD.status = 'NEW' AND NEW.status IN ('ARCHIVED', 'DELETED')) OR
        (OLD.status = 'DELETED' AND NEW.status = 'NEW')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status validation
CREATE TRIGGER product_status_transition
    BEFORE UPDATE OF status ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_status_transition();