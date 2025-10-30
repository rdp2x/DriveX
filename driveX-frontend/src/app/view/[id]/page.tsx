"use client";

import * as React from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FilePreview from "@/components/file-preview";

import { useAuth } from "@/context/auth-context";

type ViewData = {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
  size: number;
  kind: string;
  description?: string;
};

export default function ViewFilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const { data, error, isLoading } = useSWR<ViewData>(
    token ? [`/files/${id}`, token] : null,
    async ([_key, t]) => {
      const { fileAPI } = await import("@/lib/api");
      const response = await fileAPI.getFile(id, t as string);

      if (!response.success) {
        throw new Error(response.message || "Failed to load file");
      }

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        url: response.data.url,
        uploadedAt: response.data.uploadedAt,
        size: response.data.size,
        kind: response.data.kind,
        description: response.data.description,
      };
    }
  );

  React.useEffect(() => {
    if (!token) router.replace("/auth");
  }, [token, router]);

  return (
    <main className="min-h-dvh max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back
        </Button>
        <div className="text-sm text-muted-foreground">{data?.name}</div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading preview...
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-destructive">
            Failed to load file: {error.message}
          </div>
        </div>
      )}
      {data && (
        <div className="grid gap-4">
          <FilePreview mimeType={data.mimeType} src={data.url} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(data.uploadedAt).toLocaleString()}</span>
            <span>{Math.round(data.size / 1024)} KB</span>
          </div>
          {data.description && (
            <div className="text-sm text-muted-foreground border-t pt-2">
              <strong>Description:</strong> {data.description}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
