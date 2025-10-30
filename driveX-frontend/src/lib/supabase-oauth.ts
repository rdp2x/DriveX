// Simple utility to handle Supabase Google OAuth redirect
// No additional packages needed - uses vanilla JavaScript

export const initiateGoogleOAuth = () => {
  const supabaseUrl = "https://rqrtrggfjsiijxziljxt.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnRyZ2dmanNpaWp4emlsanh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjgwODYsImV4cCI6MjA3NTc0NDA4Nn0.7w5zU3f99NcgsCEEVEJMG_PmHaEzj4WXWqm1CPxqKF0";

  const redirectUrl = `${window.location.origin}/auth/callback`;

  // Direct redirect to Supabase Google OAuth
  const googleOAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    redirectUrl
  )}`;

  window.location.href = googleOAuthUrl;
};

export const handleOAuthCallback = () => {
  // Get the URL fragment that contains the tokens
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const tokenType = hashParams.get("token_type");
  const expiresIn = hashParams.get("expires_in");

  if (accessToken) {
    return {
      accessToken,
      refreshToken: refreshToken || "", // Refresh token might be null for some providers
      tokenType,
      expiresIn: expiresIn ? parseInt(expiresIn) : null,
    };
  }

  return null;
};
