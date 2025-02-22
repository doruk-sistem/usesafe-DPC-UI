import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file"
  );
}

// supabase client reference: https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
