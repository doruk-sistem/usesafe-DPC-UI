import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const supabase = await createClient();

  try {
    // Önce oturum bilgilerini kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Kullanıcının şirket ID'sini al
    const companyId = session.user.user_metadata.company_id;
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID not found' },
        { status: 400 }
      );
    }

    // Kullanıcının şirkete ait olduğunu doğrula
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: `User not found: ${userError?.message || 'User does not exist'}` },
        { status: 404 }
      );
    }
    
    const metadata = userData.user.user_metadata as { company_id?: string };
    if (metadata?.company_id !== companyId) {
      return NextResponse.json(
        { error: 'You can only delete users from your company' },
        { status: 403 }
      );
    }

    // Kullanıcıyı sil - Supabase admin API'si ile
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message}` },
      { status: 500 }
    );
  }
}
