"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { handleOAuthCallback } from "@/lib/supabase-oauth";
import { authAPI } from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";

export default function AuthCallback() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    let isProcessing = false; // Prevent multiple simultaneous calls

    const processCallback = async () => {
      if (isProcessing) {
        console.log("Authentication already in progress, skipping");
        return;
      }

      isProcessing = true;
      try {
        // Extract tokens from URL
        const tokens = handleOAuthCallback();

        if (!tokens) {
          throw new Error("No tokens found in callback");
        }

        // Send tokens to your Java backend
        console.log("Sending tokens to backend:", {
          accessToken: tokens.accessToken.substring(0, 50) + "...",
          refreshToken: tokens.refreshToken?.substring(0, 50) + "..." || "null",
        });

        const response = await authAPI.googleAuth({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || "",
        });

        console.log("Backend response:", response);

        if (response.success && response.data) {
          // Set the token from your backend (not Supabase token)
          setToken(response.data.accessToken);

          // Set user data
          setUser({
            id: response.data.name, // Will be updated when we call /auth/me
            name: response.data.name,
            email: response.data.email,
          });

          console.log("Authentication successful, redirecting to dashboard");
          // Redirect to dashboard
          router.replace("/dashboard");
        } else {
          console.error("Authentication failed:", response);
          throw new Error(response.message || "Authentication failed");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        // Redirect to auth page with error
        router.replace("/auth?error=oauth_failed");
      } finally {
        isProcessing = false;
      }
    };

    // Add a small delay to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      processCallback();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
