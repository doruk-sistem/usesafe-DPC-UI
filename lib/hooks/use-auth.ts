"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import type {
  Session,
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";

import { useToast } from "@/components/ui/use-toast";
import { useCompany } from "./use-company";

// Kullanıcı tipini genişletiyoruz çünkü user_metadata'ya ihtiyacımız var
interface ExtendedUser extends SupabaseUser {
  user_metadata: {
    role?: string;
    full_name?: string;
    company_id?: string;
    [key: string]: any;
  };
}

export function useAuth() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { toast } = useToast();

  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: company,
    isLoading: isCompanyLoading,
    error: companyError
  } = useCompany(user?.user_metadata?.company_id || "");

  const getSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("getSession error", error);
      return;
    }

    setSession(data.session);
    setUser((data.session?.user as ExtendedUser) || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser((session?.user as ExtendedUser) || null);
    });

    return () => subscription.unsubscribe();
  }, [getSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data } = await supabase.auth.getUser();
      setUser(data.user as ExtendedUser);

      toast({
        title: t("success.signIn.title"),
        description: t("success.signIn.description"),
      });

      if (data.user?.user_metadata?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: t("errors.signIn.title"),
        description: t("errors.signIn.description"),
        variant: "destructive",
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: ExtendedUser["user_metadata"] = {}
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;

      toast({
        title: t("success.signUp.title"),
        description: t("success.signUp.description"),
      });

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
      
      setUser(null);
      setSession(null);
      router.push("/auth/login");
      
      toast({
        title: t("success.signOut.title"),
        description: t("success.signOut.description"),
      });
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

  const verifyOtp = async (token: string, type: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) throw error;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return { session };
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === "admin";
  };

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    verifyOtp,
    isAdmin,
    company,
    isCompanyLoading,
    companyError,
  };
}