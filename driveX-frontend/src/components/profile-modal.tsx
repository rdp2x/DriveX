"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield, X, HardDrive } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { fileAPI, authAPI } from "@/lib/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProfileModal({ open, onOpenChange }: Props) {
  const { token, user, setUser } = useAuth();
  const [showPasswordMessage, setShowPasswordMessage] = React.useState(false);
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

  const handleChangePassword = () => {
    setShowPasswordMessage(true);
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setShowPasswordMessage(false);
    }, 5000);
  };

  const handleUpdateDetails = () => {
    // In a real app, this would open an edit form or navigate to an edit page
    console.log("Update details clicked");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-card/90 backdrop-blur-md border-gray-800">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">Profile</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="hover:bg-destructive/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
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
                  <p className="text-xs text-muted-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Loading..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Plan</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Storage</p>
                  <p className="text-xs text-muted-foreground">
                    {storageData.storageUsed} of {storageData.storageTotal} used
                    • {storageData.filesCount} files
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset Message */}
          {showPasswordMessage && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary">
                ✓ Password reset link has been sent to your email.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleUpdateDetails}
            >
              Update Details
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
