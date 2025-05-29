"use client";

import { useState, useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase/client';

import { useAuth } from "./use-auth";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

// Supabase'den gelen kullanıcı verisi
interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: string;
    company_id?: string;
    company_name?: string;
  };
  created_at: string;
}

// Davet durumları
enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired"
}

// Davet bilgisi
interface Invitation {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: InvitationStatus;
  created_at: string;
  company_id: string;
  company_name?: string;
}

interface InviteUserParams {
  email: string;
  full_name: string;
  role?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { user, company } = useAuth();
  
  // Davetleri getir
  const fetchInvitations = async () => {
    if (!company?.id) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: `Error fetching invitations: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: `Error fetching invitations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Kullanıcı listesini getir
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kullanıcılar getirilirken bir hata oluştu");
      }
      const data = await response.json();
      
      // Supabase'den gelen kullanıcı verilerini dönüştür
      const formattedUsers = (data.users || []).map((user: SupabaseUser) => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'user',
        created_at: user.created_at
      }));
      
      setUsers(formattedUsers);
      
      // Kabul edilen davetleri kontrol et
      if (formattedUsers.length > 0) {
        await fetchInvitations();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı davet et
  const inviteUser = async ({ email, full_name, role = "user" }: InviteUserParams) => {
    setInviting(true);
    try {
      // Şirket bilgilerini kontrol et
      if (!user?.user_metadata?.company_id && !company?.id) {
        throw new Error("Şirket bilgisi bulunamadı");
      }

      const companyId = user?.user_metadata?.company_id || company?.id;
      const companyName = user?.user_metadata?.company_name || company?.name || "";

      // Supabase'e davet ekle
      const { data, error } = await supabase
        .from('invitations')
        .insert([
          {
            email,
            full_name,
            role,
            company_id: companyId,
            created_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Davet listesini güncelle
      await fetchInvitations();

      toast({
        title: "Başarılı",
        description: `${email} adresine davet gönderildi. Kullanıcı daveti kabul ettiğinde listeye eklenecek.`,
      });

      return true;
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setInviting(false);
    }
  };
  
  // Davet durumunu güncelle
  const updateInvitationStatus = async (invitationId: string, status: InvitationStatus) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status })
        .eq('id', invitationId);

      if (error) throw error;
      
      await fetchInvitations();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Davet durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };
  
  // Daveti sil
  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      
      await fetchInvitations();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Davet silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Kullanıcı sil
  const deleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kullanıcı silinirken bir hata oluştu");
      }

      // Kullanıcı listesini güncelle
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // İlgili davetleri kontrol et
      await fetchInvitations();

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi",
      });

      return true;
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // İlk yüklemede davetleri getir
  useEffect(() => {
    if (company?.id) {
      fetchInvitations();
    }
  }, [company?.id]);

  return {
    users,
    invitations,
    loading,
    inviting,
    deleting,
    fetchUsers,
    inviteUser,
    deleteUser,
    updateInvitationStatus,
    deleteInvitation,
  };
}
