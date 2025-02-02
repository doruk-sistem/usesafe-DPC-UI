"use client";

import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { CompanyService } from '@/lib/services/company';
import type { Company } from '@/lib/types/company';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCompany = useCallback(async (companyId: string) => {
    try {
      const companyData = await CompanyService.getCompany(companyId);
      setCompany(companyData);
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.company_id) {
        fetchCompany(session.user.user_metadata.company_id);
      }
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.company_id) {
        fetchCompany(session.user.user_metadata.company_id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchCompany]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get session after sign in
    const { data: { session } } = await supabase.auth.getSession();
    
    // Redirect based on role
    if (session?.user?.user_metadata?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
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
    router.push('/');
  };
  
  const isAdmin = () => {
    return user?.user_metadata?.role === 'admin';
  };

  return {
    user,
    company,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };
}