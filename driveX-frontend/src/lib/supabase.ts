import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Google OAuth configuration
export const googleOAuthConfig = {
  provider: "google" as const,
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
};
