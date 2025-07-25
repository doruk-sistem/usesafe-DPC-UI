"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { companyApiHooks } from "@/lib/hooks/use-company";
import { supabase } from "@/lib/supabase/client";
import { Company } from "@/lib/types/company";


export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("auth");

  const companyId = user?.user_metadata?.data?.company_id || user?.user_metadata?.company_id;

  const {
    data: company,
    isLoading: isCompanyLoading,
    isFetched: isCompanyFetched,
  } = companyApiHooks.useGetCompanyQuery(
    { id: companyId },
    { enabled: !!companyId }
  ) as { data: Company | null; isLoading: boolean; isFetched: boolean };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get session after sign in
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Show success toast with hardcoded message
    toast({
      title: "Login Successful",
      description: "You have been successfully logged in.",
    });

    // Redirect based on role
    if (session?.user?.user_metadata?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: {
      role: "admin" | "manufacturer";
      full_name: string;
      company_id?: string;
    }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;

      // Redirect to verify-email page without showing toast
      // The verify-email page will show the appropriate message
      router.push("/auth/verify-email");
    } catch (error) {
      toast({
        title: t("errors.signUp.title"),
        description: t("errors.signUp.description"),
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth/login");
    } catch (error) {
      toast({
        title: t("errors.signOut.title"),
        description: t("errors.signOut.description"),
        variant: "destructive",
      });
    }
  };

  const updateUser = async (attributes: UserAttributes) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: attributes,
      });
      if (error) throw error;

      toast({
        title: t("success.updateUser.title"),
        description: t("success.updateUser.description"),
      });
    } catch (error) {
      toast({
        title: t("errors.updateUser.title"),
        description: t("errors.updateUser.description"),
        variant: "destructive",
      });
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;

      toast({
        title: t("success.updatePassword.title"),
        description: t("success.updatePassword.description"),
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("password")) {
          throw new Error("Your new password cannot be the same as the password you last used. Please choose a different password.");
        }
      }
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === "admin";
  };

  const canManageUsers = () => {
    // Kullanıcı yönetimi yapabilecek roller:
    // 1. Sistem yöneticileri (admin)
    // 2. Şirket yöneticileri (company_admin)
    // 3. Şirketi ilk oluşturan kişi (invited_at null olan manufacturer)
    
    // Sistem yöneticisi kontrolü
    if (isAdmin()) return true;
    
    // Şirket yöneticisi kontrolü
    if (user?.user_metadata?.role === "company_admin") return true;
    
    // Şirketi ilk oluşturan kişi kontrolü
    const isCompanyCreator = user?.user_metadata?.role === "manufacturer" && 
                             !user?.invited_at;
    
    return isCompanyCreator;
  };

  const verifyOtp = async (token: string, type: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any, // 'signup', 'email' veya 'recovery' olabilir
    });
    
    if (error) throw error;
    
    // Get session after verification
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    return { session };
  };

  const resetPassword = async (email: string) => {
    try {
      // Geliştirme ortamı URL'sini kullan
      const baseUrl = "https://app.usesafe.net";
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  return {
    user,
    company,
    isLoading,
    isCompanyLoading,
    isCompanyFetched,
    signIn,
    signUp,
    signOut,
    updateUser,
    updatePassword,
    isAdmin,
    canManageUsers,
    verifyOtp,
    resetPassword,
  };
}
