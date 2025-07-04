import { supabase } from '@/lib/supabase/client';

export interface DashboardMetrics {
  totalManufacturers: { count: number; change: number };
  pendingApprovals: { count: number; change: number };
  activeDPCs: { count: number; change: number };
  documentVerifications: { count: number; change: number };
  systemAlerts: { count: number; change: number };
  verificationRate: { rate: number; change: number };
}

export interface RecentApproval {
  id: string;
  name: string;
  code: string;
  type: 'manufacturer' | 'document' | 'dpc';
  timestamp: Date;
}

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const { count: manufacturersCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact' });

    const { count: lastMonthManufacturers } = await supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

    const { count: pendingApprovalsCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('status', false);

    const { count: activeDPCsCount } = await supabase
      .from('dpps')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    const { count: documentVerificationsCount } = await supabase
      .from('company_documents')
      .select('*', { count: 'exact' });

    const { count: systemAlertsCount } = await supabase
      .from('system_alerts')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    const { count: verifiedDocsCount } = await supabase
      .from('company_documents')
      .select('*', { count: 'exact' })
      .eq('status', 'verified');

    const safeVerifiedDocsCount = verifiedDocsCount ?? 0;
    const safeDocumentVerificationsCount = documentVerificationsCount ?? 0;
    const verificationRate = safeDocumentVerificationsCount > 0
      ? (safeVerifiedDocsCount / safeDocumentVerificationsCount) * 100
      : 0;

    const safeManufacturersCount = manufacturersCount ?? 0;
    const safeLastMonthManufacturers = lastMonthManufacturers ?? 0;
    const manufacturersChange = safeLastMonthManufacturers > 0
      ? ((safeManufacturersCount - safeLastMonthManufacturers) / safeLastMonthManufacturers) * 100
      : 0;

    return {
      totalManufacturers: { 
        count: safeManufacturersCount, 
        change: manufacturersChange 
      },
      pendingApprovals: {
        count: pendingApprovalsCount ?? 0,
        change: -4.5
      },
      activeDPCs: {
        count: activeDPCsCount ?? 0,
        change: 23.1
      },
      documentVerifications: {
        count: safeDocumentVerificationsCount,
        change: 8.2
      },
      systemAlerts: {
        count: systemAlertsCount ?? 0,
        change: -2.4
      },
      verificationRate: {
        rate: verificationRate,
        change: 1.2
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

export async function getRecentApprovals(): Promise<RecentApproval[]> {
  try {
    const { data: recentApprovals } = await supabase
      .from('companies')
      .select('id, name, created_at')
      .eq('status', true)
      .order('created_at', { ascending: false })
      .limit(5);

    return (recentApprovals || []).map(approval => ({
      id: approval.id,
      name: approval.name,
      code: `MFR-${approval.id.slice(0, 3)}`,
      type: 'manufacturer' as const,
      timestamp: new Date(approval.created_at)
    }));
  } catch (error) {
    console.error('Error fetching recent approvals:', error);
    throw error;
  }
}

export async function getSystemAlerts(): Promise<SystemAlert[]> {
  try {
    const { data: alerts } = await supabase
      .from('system_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    return (alerts || []).map(alert => ({
      id: alert.id,
      message: alert.message,
      severity: alert.severity,
      timestamp: new Date(alert.created_at)
    }));
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    throw error;
  }
}
