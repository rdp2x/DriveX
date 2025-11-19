"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, File as FileIcon } from "lucide-react";

export type DropzoneProps = {
  onFiles: (files: File[]) => void;
  accept?: string[]; // list of mime types or extensions like ".png"
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  disabled = false,
  className,
  children,
}: DropzoneProps) {
  const [isOver, setIsOver] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const filtered = accept && accept.length
      ? list.filter((f) =>
          accept.some((a) =>
            a.startsWith(".")
              ? f.name.toLowerCase().endsWith(a.toLowerCase())
              : f.type === a || f.type.startsWith(a.replace("/*", "/"))
          )
        )
      : list;
    if (!multiple && filtered.length > 1) {
      onFiles([filtered[0]]);
    } else {
      onFiles(filtered);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // reset input to allow re-selecting same file
      e.currentTarget.value = "";
    }
  };

  // Optional: paste support
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.files;
      if (items && items.length > 0) {
        handleFiles(items);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, accept?.join(","), multiple]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={handleOpenFileDialog}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpenFileDialog();
      }}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : isOver
          ? "border-primary/60 bg-primary/5"
          : "border-muted-foreground/20 hover:border-primary/40",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={onChange}
        accept={accept?.join(",")}
        disabled={disabled}
      />
      {children ? (
        children
      ) : (
        <>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">Any file up to your storage limit</div>
        </>
      )}
    </div>
  );
}

export function FileListPreview({ files }: { files: File[] }) {
  if (!files?.length) return null;
  return (
    <ul className="mt-2 max-h-40 overflow-auto divide-y rounded border bg-card">
      {files.map((f, idx) => (
        <li key={idx} className="flex items-center gap-3 p-2 text-sm">
          <FileIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate" title={f.name}>{f.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {(f.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </li>
      ))}
    </ul>
  );
}
