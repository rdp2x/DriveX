"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ButtonSpinner from "@/components/button-spinner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  token: string | null;
  onUploaded: () => void;
};

export default function UploadModal({
  open,
  onOpenChange,
  token,
  onUploaded,
}: Props) {
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentFile, setCurrentFile] = React.useState<string | null>(null);

  const onSubmit = async () => {
    if (!files || files.length === 0 || !token) return;
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const { fileAPI } = await import("@/lib/api");
      const fileArray = Array.from(files);
      let uploadedCount = 0;

      // Upload files one by one
      for (const file of fileArray) {
        setCurrentFile(file.name);
        const response = await fileAPI.upload(file, undefined, token);

        if (!response.success) {
          throw new Error(response.message || `Failed to upload ${file.name}`);
        }

        uploadedCount++;
        setProgress((uploadedCount / fileArray.length) * 100);
      }

      setCurrentFile(null);

      onUploaded();
      onOpenChange(false);

      // Reset form state
      setFiles(null);
      setProgress(0);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setFiles(null);
      setProgress(0);
      setError(null);
      setCurrentFile(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
          {!token && (
            <p className="text-sm text-destructive">
              Please login to upload files
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading && (
            <div className="space-y-2">
              {currentFile && (
                <p className="text-sm text-muted-foreground">
                  Uploading: {currentFile}
                </p>
              )}
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading || !files || files.length === 0 || !token}
            >
              {loading ? <ButtonSpinner /> : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
