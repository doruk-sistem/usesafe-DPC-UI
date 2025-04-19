"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  Session,
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data } = await supabase.auth.getUser();
    setUser(data.user as ExtendedUser);

    if (data.user?.user_metadata?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: ExtendedUser["user_metadata"] = {}
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    router.push("/");
  };

  const updateUser = async (attributes: UserAttributes) => {
    const { error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
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
