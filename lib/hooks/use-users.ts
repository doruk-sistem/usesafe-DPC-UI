"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  
  // LocalStorage'dan davetleri yükle
  useEffect(() => {
    const savedInvitations = localStorage.getItem('invitations');
    if (savedInvitations) {
      try {
        const parsed = JSON.parse(savedInvitations);
        setInvitations(parsed);
      } catch (e) {
        console.error('Failed to parse invitations from localStorage', e);
      }
    }
  }, []);

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
      
      // Kabul edilen davetleri kontrol et ve bekleyen davetlerden kaldır
      if (formattedUsers.length > 0 && invitations.length > 0) {
        const userEmails = formattedUsers.map(user => user.email.toLowerCase());
        const updatedInvitations = invitations.filter(invitation => {
          // Eğer kullanıcı listesinde bu e-posta adresi varsa, daveti kaldır
          return !userEmails.includes(invitation.email.toLowerCase());
        });
        
        // Eğer davet listesi değiştiyse, güncelle
        if (updatedInvitations.length !== invitations.length) {
          setInvitations(updatedInvitations);
          saveInvitations(updatedInvitations);
        }
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

  // Davetleri LocalStorage'a kaydet
  const saveInvitations = (invites: Invitation[]) => {
    try {
      localStorage.setItem('invitations', JSON.stringify(invites));
    } catch (e) {
      console.error('Failed to save invitations to localStorage', e);
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

      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name,
          company_id: companyId,
          company_name: companyName,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Davet gönderilirken bir hata oluştu");
      }

      const result = await response.json();
      
      // Daveti kaydet
      const newInvitation: Invitation = {
        id: `inv_${Date.now()}`,
        email,
        full_name,
        role,
        status: InvitationStatus.PENDING,
        created_at: new Date().toISOString()
      };
      
      const updatedInvitations = [...invitations, newInvitation];
      setInvitations(updatedInvitations);
      saveInvitations(updatedInvitations);

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
  const updateInvitationStatus = (invitationId: string, status: InvitationStatus) => {
    const updatedInvitations = invitations.map(invitation => 
      invitation.id === invitationId 
        ? { ...invitation, status } 
        : invitation
    );
    
    setInvitations(updatedInvitations);
    saveInvitations(updatedInvitations);
  };
  
  // Daveti sil
  const deleteInvitation = (invitationId: string) => {
    const updatedInvitations = invitations.filter(invitation => invitation.id !== invitationId);
    setInvitations(updatedInvitations);
    saveInvitations(updatedInvitations);
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

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi",
      });

      // Kullanıcı listesini güncelle
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
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
