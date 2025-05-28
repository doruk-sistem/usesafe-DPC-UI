import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, company_name, full_name, company_id, role = 'user' } = body;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        company_name,
        role,
        full_name,
        company_id
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`
    });
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'User invited successfully', data });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to invite user: ${error.message}` },
      { status: 500 }
    );
  }
}
