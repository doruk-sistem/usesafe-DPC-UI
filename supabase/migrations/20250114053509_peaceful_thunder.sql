/*
  # Add DPP Configuration Column

  1. Changes
    - Add dpp_config JSONB column to products table
    - Add validation trigger for dpp_config structure
  
  2. Validation
    - Ensures dpp_config has valid sections array
    - Each section must have id, title, and fields
*/

-- Add dpp_config column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dpp_config JSONB DEFAULT NULL;

-- Create function to validate dpp_config JSON structure
CREATE OR REPLACE FUNCTION validate_dpp_config()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation if dpp_config is null
    IF NEW.dpp_config IS NULL THEN
        RETURN NEW;
    END IF;

    -- Validate basic structure
    IF jsonb_typeof(NEW.dpp_config->'sections') != 'array' THEN
        RAISE EXCEPTION 'dpp_config must have a sections array';
    END IF;

    -- Validate each section
    FOR i IN 0..jsonb_array_length(NEW.dpp_config->'sections')-1 LOOP
        IF (NEW.dpp_config->'sections'->i->>'id') IS NULL OR
           (NEW.dpp_config->'sections'->i->>'title') IS NULL OR
           jsonb_typeof(NEW.dpp_config->'sections'->i->'fields') != 'array' THEN
            RAISE EXCEPTION 'Each section must have id, title, and fields array';
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for dpp_config validation
CREATE TRIGGER validate_dpp_config_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_dpp_config();