"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { supabase } from "@/lib/supabase/client";
import { companyService } from "@/lib/services/company";
import { Company } from "@/lib/types/company";
import { ManufacturerService } from "@/lib/services/manufacturer";
import { productService } from "@/lib/services/product";

import type { User } from "../types/auth";

import { companyApiHooks } from "./use-company";
import { useToast } from "@/components/ui/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("auth");

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company", user?.user_metadata?.company_id],
    queryFn: () => {
      // For admin users, return a default company object
      if (user?.user_metadata?.role === "admin") {
        return Promise.resolve({
          id: "admin",
          name: "Admin Company",
          taxInfo: {},
          companyType: "admin",
          status: "active"
        });
      }
      return companyService.getCompany(user?.user_metadata?.company_id as string);
    },
    enabled: !!user?.user_metadata?.company_id || user?.user_metadata?.role === "admin",
  });

  const { data: manufacturer, isLoading: isManufacturerLoading } = useQuery({
    queryKey: ["manufacturer", user?.user_metadata?.company_id],
    queryFn: () => {
      // For admin users, return a default manufacturer object
      if (user?.user_metadata?.role === "admin") {
        return Promise.resolve({
          id: "admin",
          name: "Admin Manufacturer",
          taxInfo: {},
          companyType: "admin",
          status: "active"
        });
      }
      return ManufacturerService.getManufacturer(user?.user_metadata?.company_id as string);
    },
    enabled: !!user?.user_metadata?.company_id || user?.user_metadata?.role === "admin",
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
    try {
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
    metadata: {
      role: "admin" | "manufacturer";
      full_name: string;
      company_id: string;
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
    manufacturer,
    isLoading: isLoading || isCompanyLoading || isManufacturerLoading,
    isCompanyLoading,
    isAdmin: isAdminFunction,
    isAdminValue,
    signIn,
    signUp,
    signOut,
    updateUser,
    verifyOtp,
  };
}
