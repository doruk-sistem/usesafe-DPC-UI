"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import type { User } from "../types/auth";

import { companyApiHooks } from "./use-company";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    data: company,
    isLoading: isCompanyLoading,
    isFetched: isCompanyFetched,
  } = companyApiHooks.useGetCompanyQuery(
    { id: user?.user_metadata?.company_id },
    { enabled: !!user?.user_metadata?.company_id }
  );

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
    metadata: Pick<User["user_metadata"], "role" | "full_name" | "company_id">
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push("/");
  };

  const updateUser = async (attributes: UserAttributes) => {
    const { error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === "admin";
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

  return {
    user,
    company,
    isCompanyLoading,
    isCompanyFetched,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    updateUser,
    verifyOtp,
  };
}
