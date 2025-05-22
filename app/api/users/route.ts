import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
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

    // Şirkete ait kullanıcıları getir
    // Supabase auth API'sini kullanarak tüm kullanıcıları getir
    const { data, error } = await supabase.auth.admin.listUsers();
    
    // Sadece belirli şirkete ait kullanıcıları filtrele
    const filteredUsers = data?.users?.filter((user: User) => {
      const metadata = user.user_metadata as { company_id?: string };
      return metadata?.company_id === companyId;
    }) || [];

    if (error) throw error;

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch users: ${error.message}` },
      { status: 500 }
    );
  }
}
