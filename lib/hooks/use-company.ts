import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Company } from "@/lib/types/company";

interface UseCompaniesOptions {
  status?: string;
  type?: string;
}

export function useCompanies(options: UseCompaniesOptions = {}) {
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("companies").select("*");

        if (options.status) {
          query = query.eq("status", options.status);
        }

        if (options.type) {
          query = query.eq("companyType", options.type);
        }

        const { data: companies, error } = await query;

        if (error) throw error;
        setData(companies || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [options.status, options.type]);

  return { data, isLoading, error };
}

export function useCompany(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  return { company, isLoading, error };
}
