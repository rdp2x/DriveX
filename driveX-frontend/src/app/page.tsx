"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import LoadingSpinner from "@/components/loading-spinner";

export default function Home() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    }
  }, [token, isLoading, router]);

  // Show nothing while checking auth to prevent flash
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
