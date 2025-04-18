"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { companyService } from "@/lib/services/company";
import { ManufacturerService } from "@/lib/services/manufacturer";
import { productService } from "@/lib/services/product";
import { supabase } from "@/lib/supabase/client";
import { Company } from "@/lib/types/company";

import type { User } from "../types/auth";

import { companyApiHooks } from "./use-company";


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
          status: true
        });
      }
      
      // Eğer company_id yoksa, varsayılan bir firma nesnesi döndür
      if (!user?.user_metadata?.company_id) {
        return Promise.resolve({
          id: "default",
          name: "Default Company",
          taxInfo: {},
          companyType: "user",
          status: true
        });
      }
      
      // companyService.getCompany fonksiyonu bir nesne bekliyor, string değil
      return companyService.getCompany({ id: user.user_metadata.company_id });
    },
    enabled: !!user, // Kullanıcı giriş yapmışsa firma bilgilerini yükle
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
          status: true
        });
      }
      
      // Eğer company_id yoksa, varsayılan bir üretici nesnesi döndür
      if (!user?.user_metadata?.company_id) {
        return Promise.resolve({
          id: "default",
          name: "Default Manufacturer",
          taxInfo: {},
          companyType: "user",
          status: true
        });
      }
      
      // companyService.getManufacturer fonksiyonu string parametre bekliyor
      return companyService.getManufacturer(user.user_metadata.company_id);
    },
    enabled: !!user, // Kullanıcı giriş yapmışsa üretici bilgilerini yükle
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          user_metadata: {
            ...session.user.user_metadata,
            email_verified: session.user.email_confirmed_at != null
          }
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          user_metadata: {
            ...session.user.user_metadata,
            email_verified: session.user.email_confirmed_at != null
          }
        });
      } else {
        setUser(null);
      }
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
    } catch (error) {
      throw error; // Re-throw the error to be handled by the login form
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
