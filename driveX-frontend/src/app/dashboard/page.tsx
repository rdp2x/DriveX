"use client";

import * as React from "react";
import useSWR from "swr";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import UploadModal from "@/components/upload-modal";
import ProfileModal from "@/components/profile-modal";
import { useAuth } from "@/context/auth-context";
import type { FileItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function kindFromMime(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.includes("pdf") ||
    mime.includes("text") ||
    mime.includes("word") ||
    mime.includes("sheet")
  )
    return "document";
  return "other";
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<string>("all");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR<FileItem[]>(
    token ? ["/files", token, filter, query] : null,
    async ([_key, token, currentFilter, currentQuery]) => {
      const { fileAPI } = await import("@/lib/api");
      const response = await fileAPI.list(
        0,
        20,
        currentFilter as string,
        currentQuery as string,
        token as string
      );

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data.files;
    }
  );

  // Files are already filtered on the backend, but we can add client-side filtering if needed
  const filtered = data || [];

  const handleDelete = async (id: string) => {
    try {
      const { fileAPI } = await import("@/lib/api");
      const response = await fileAPI.deleteFile(id, token || undefined);

      if (!response.success) {
        throw new Error(response.message);
      }

      mutate(); // Refresh the file list
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleDownload = async (id: string) => {
    // Files have public URLs, so we can just open them directly
    const file = filtered.find((f) => f.id === id);
    if (file?.url) {
      window.open(file.url, "_blank");
    }
  };

  // Simple client-side route guard
  React.useEffect(() => {
    if (!token) {
      window.location.replace("/auth");
    }
  }, [token]);

  return (
    <main className="h-dvh overflow-hidden">
      <Navbar onOpenProfile={() => setProfileOpen(true)} onSearch={setQuery} />
      <div className="w-full h-[calc(100vh-theme(spacing.24))]">
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6 px-4 h-full">
          <Sidebar
            active={filter}
            onChange={setFilter}
            storageUsed={2.5 * 1024 * 1024 * 1024} // 2.5 GB used
            storageTotal={10 * 1024 * 1024 * 1024} // 10 GB total
          />
          <section className="h-full pt-6 overflow-y-auto">
            {isLoading && (
              <div className="text-sm text-muted-foreground p-4">
                Loading files...
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive p-4">
                Failed to load files
              </div>
            )}
            {!isLoading && !error && (
              <FileGrid
                files={filtered}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            )}
          </section>
        </div>
      </div>

      {/* Floating upload button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0"
        onClick={() => setUploadOpen(true)}
        aria-label="Upload"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        token={token}
        onUploaded={() => mutate()}
      />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </main>
  );
}
