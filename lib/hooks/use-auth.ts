"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { companyService } from "@/lib/services/company";
import { Company } from "@/lib/types/company";

import type { User } from "../types/auth";

import { companyApiHooks } from "./use-company";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { data: company } = useQuery({
    queryKey: ["company", user?.user_metadata?.company_id],
    queryFn: async () => {
      if (!user?.user_metadata?.company_id) return null;
      return companyService.getCompany({ id: user.user_metadata.company_id });
    },
    enabled: !!user?.user_metadata?.company_id,
  });

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
    metadata: {
      role: "admin" | "manufacturer";
      full_name: string;
      company_id: string;
    }
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

  // Create a function that can be called as isAdmin()
  const isAdminFunction = () => {
    return user?.user_metadata?.role === "admin";
  };

  // Create a boolean value that can be used as isAdmin
  const isAdminValue = user?.user_metadata?.role === "admin";

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
    isAdmin: isAdminFunction,
    isAdminValue,
    signIn,
    signUp,
    signOut,
    updateUser,
    verifyOtp,
  };
}
