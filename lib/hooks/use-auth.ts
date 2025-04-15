"use client";

import type {
  User as SupabaseUser,
  UserAttributes,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";

import { supabase } from "@/lib/supabase/client";

import type { User } from "../types/auth";

import { useCompany } from "./use-company";
import { AuthContext } from '../context/auth-context';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
