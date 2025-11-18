"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, HardDrive, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { fileAPI, authAPI } from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProfileModal({ open, onOpenChange }: Props) {
  const { token, user, setUser, logout } = useAuth();
  const router = useRouter();
  const [showPasswordMessage, setShowPasswordMessage] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [storageData, setStorageData] = React.useState<{
    storageUsed: string;
    storageTotal: string;
    filesCount: number;
  }>({
    storageUsed: "0 B",
    storageTotal: "10 GB",
    filesCount: 0,
  });

  // Fetch storage usage, file count, and user data when modal opens
  React.useEffect(() => {
    if (open && token) {
      const fetchData = async () => {
        try {
          // Get current user data (including createdAt) only if not already loaded
          if (!user?.createdAt) {
            const userResponse = await authAPI.getCurrentUser(token);
            if (userResponse.success && userResponse.data) {
              setUser({
                id: userResponse.data.id,
                name: userResponse.data.name,
                email: userResponse.data.email,
                createdAt: userResponse.data.createdAt,
              });
            }
          }

          // Get storage usage and file count in parallel
          const [storageResponse, filesResponse] = await Promise.all([
            fileAPI.getStorageUsage(token),
            fileAPI.list(0, 1, "all", undefined, token),
          ]);

          // Update storage data
          const newStorageData = { ...storageData };

          if (storageResponse.success) {
            const usedBytes = storageResponse.data.storageUsed;
            newStorageData.storageUsed =
              usedBytes < 1024 * 1024
                ? `${Math.round(usedBytes / 1024)} KB`
                : usedBytes < 1024 * 1024 * 1024
                ? `${Math.round(usedBytes / (1024 * 1024))} MB`
                : `${(usedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
          }

          if (filesResponse.success) {
            newStorageData.filesCount = filesResponse.data.total;
          }

          setStorageData(newStorageData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };

      fetchData();
    }
  }, [open, token]);

  const handleChangePassword = async () => {
    if (!user?.email) {
      setPasswordError("Email not found. Please try logging in again.");
      return;
    }

    setIsResettingPassword(true);
    setPasswordError(null);
    setShowPasswordMessage(false);

    try {
      await authAPI.forgotPassword(user.email);
      setShowPasswordMessage(true);
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setShowPasswordMessage(false);
      }, 5000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to send password reset email");
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setPasswordError(null);
      }, 5000);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false);
    router.replace("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] min-h-[500px] bg-card/90 backdrop-blur-md border-gray-800" style={{ maxWidth: '400px' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* User Basic Info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "Not loaded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <div className="text-xs text-muted-foreground">
                    {user?.createdAt ? (
                      new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    ) : (
                      <LoadingSpinner size="small" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Storage Used</p>
                  <p className="text-xs text-muted-foreground">
                    {storageData.storageUsed} • {storageData.filesCount} files
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset Message */}
          {showPasswordMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Password reset link has been sent to {user?.email}
              </p>
            </div>
          )}

          {/* Password Error Message */}
          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                ✗ {passwordError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 space-y-2">
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleChangePassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Sending..." : "Change Password"}
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
