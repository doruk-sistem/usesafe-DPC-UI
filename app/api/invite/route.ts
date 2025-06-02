import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, company_name, full_name, company_id, role = 'user' } = body;

  const supabase = await createClient();

  try {
    // Önce davet kaydını oluştur
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert([
        {
          email,
          full_name,
          role,
          company_id,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (invitationError) throw invitationError;

    // Supabase üzerinden davet e-postası gönder
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        company_name,
        role,
        full_name,
        company_id
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`
    });

    if (inviteError) throw inviteError;

    return NextResponse.json({ 
      message: 'User invited successfully', 
      data: invitation 
    });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: `Failed to invite user: ${error.message}` },
      { status: 500 }
    );
  }
}
