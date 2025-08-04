-- Add weight column to products table
ALTER TABLE public.products 
ADD COLUMN weight DECIMAL(10,3) NULL;

-- Add comment to the column
COMMENT ON COLUMN public.products.weight IS 'Product weight in kilograms';

-- Add index for weight filtering (optional)
CREATE INDEX IF NOT EXISTS idx_products_weight ON public.products USING btree (weight) TABLESPACE pg_default;