-- Create enum type for invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status invitation_status NOT NULL DEFAULT 'pending',
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role CHECK (role IN ('user', 'company_admin'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view invitations from their company"
    ON public.invitations
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.invitations TO authenticated;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view invitations from their company" ON public.invitations;
DROP POLICY IF EXISTS "Users can view their company's invitations" ON public.invitations;

-- Create new policy
CREATE POLICY "Enable all access for authenticated users"
    ON public.invitations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.invitations TO authenticated; 