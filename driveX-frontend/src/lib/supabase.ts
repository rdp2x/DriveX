import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rqrtrggfjsiijxziljxt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnRyZ2dmanNpaWp4emlsanh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjgwODYsImV4cCI6MjA3NTc0NDA4Nn0.7w5zU3f99NcgsCEEVEJMG_PmHaEzj4WXWqm1CPxqKF0";

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
