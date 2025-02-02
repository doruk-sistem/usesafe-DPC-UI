/*
  # Add Company Type Field

  1. Changes
    - Add company_type column to companies table
    - Add check constraint for valid company types
    - Add index on company_type column
    - Add migration safety checks

  2. Security
    - No data loss - adds nullable column with default
    - Maintains RLS policies
    - Safe to run on existing data
*/

-- Add company_type column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'companyType'
  ) THEN
    -- Add the column
    ALTER TABLE companies 
    ADD COLUMN companyType TEXT;

    -- Add check constraint for valid types
    ALTER TABLE companies
    ADD CONSTRAINT valid_company_type 
    CHECK (companyType IN ('manufacturer', 'brand_owner', 'material_supplier', 'factory'));

    -- Create index for company_type
    CREATE INDEX idx_companies_type ON companies(companyType);

    -- Add comment explaining the field
    COMMENT ON COLUMN companies.company_type IS 'Type of company: manufacturer, brand_owner, material_supplier, or factory';
  END IF;
END $$;

-- Update existing records to 'manufacturer' as default
-- Only run if column was just added
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'companyType'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE companies 
    SET companyType = 'manufacturer' 
    WHERE companyType IS NULL;

    -- Make the column required after setting defaults
    ALTER TABLE companies 
    ALTER COLUMN companyType SET NOT NULL;
  END IF;
END $$;

-- Verify the changes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'company_type' 
    AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'Migration verification failed: company_type column not properly configured';
  END IF;
END $$;