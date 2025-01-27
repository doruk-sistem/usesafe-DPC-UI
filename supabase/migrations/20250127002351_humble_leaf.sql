/*
  # Add Documents Support to Products Table

  1. Changes
    - Add documents JSONB column to products table
    - Add validation trigger for documents structure
    - Add index for documents column

  2. Document Structure
    - quality_cert: Array of document objects
    - safety_cert: Array of document objects
    - test_reports: Array of document objects
    - technical_docs: Array of document objects
    - compliance_docs: Array of document objects

    Each document object contains:
    - name: Document name
    - url: Document URL
    - type: Document type
*/

-- Add documents column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Create function to validate documents JSON structure
CREATE OR REPLACE FUNCTION validate_documents_json()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation if documents is null or empty
    IF NEW.documents IS NULL OR NEW.documents = '{}'::jsonb THEN
        RETURN NEW;
    END IF;

    -- Validate document types
    IF NOT (
        jsonb_typeof(NEW.documents->'quality_cert') IN ('array', 'null') AND
        jsonb_typeof(NEW.documents->'safety_cert') IN ('array', 'null') AND
        jsonb_typeof(NEW.documents->'test_reports') IN ('array', 'null') AND
        jsonb_typeof(NEW.documents->'technical_docs') IN ('array', 'null') AND
        jsonb_typeof(NEW.documents->'compliance_docs') IN ('array', 'null')
    ) THEN
        RAISE EXCEPTION 'Invalid documents structure. Each document type must be an array or null.';
    END IF;

    -- Validate document objects in each array
    FOR doc_type IN 
        SELECT * FROM jsonb_object_keys(NEW.documents)
    LOOP
        IF jsonb_typeof(NEW.documents->doc_type) = 'array' THEN
            FOR doc IN 
                SELECT * FROM jsonb_array_elements(NEW.documents->doc_type)
            LOOP
                IF NOT (
                    doc->>'name' IS NOT NULL AND
                    doc->>'url' IS NOT NULL AND
                    doc->>'type' IS NOT NULL
                ) THEN
                    RAISE EXCEPTION 'Invalid document object structure. Each document must have name, url, and type.';
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for documents validation
DROP TRIGGER IF EXISTS validate_documents_json_trigger ON products;
CREATE TRIGGER validate_documents_json_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_documents_json();

-- Create index for documents
CREATE INDEX IF NOT EXISTS idx_products_documents ON products USING gin(documents);

-- Add comment to explain documents structure
COMMENT ON COLUMN products.documents IS 'JSON structure containing document arrays by type (quality_cert, safety_cert, test_reports, technical_docs, compliance_docs). Each document has name, url, and type.';