"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreVertical,
  FileIcon,
  ImageIcon,
  Video,
  Music,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilePreview from "@/components/file-preview";
import type { FileItem } from "@/lib/api";

function iconFor(mimeType: string, onClick?: () => void) {
  const iconClass =
    "h-8 w-8 cursor-pointer hover:scale-110 transition-transform duration-200";

  if (mimeType.startsWith("image/"))
    return <ImageIcon className={iconClass} onClick={onClick} />;
  if (mimeType.startsWith("video/"))
    return <Video className={iconClass} onClick={onClick} />;
  if (mimeType.startsWith("audio/"))
    return <Music className={iconClass} onClick={onClick} />;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("csv") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("officedocument")
  )
    return <FileText className={iconClass} onClick={onClick} />;

  // Default icon for all other file types
  return <FileIcon className={iconClass} onClick={onClick} />;
}

type Props = {
  file: FileItem;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
};

export default function FileCard({ file, onDelete, onDownload }: Props) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const sizeKB = Math.max(1, Math.round(file.size / 1024));
  const date = new Date(file.uploadedAt).toLocaleDateString();

  const handleIconClick = () => {
    setModalOpen(true);
  };

  const renderPreviewContent = () => {
    const { mimeType, url } = file;

    // Check if file type is previewable
    const isPreviewable =
      mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("text/") ||
      mimeType.includes("json") ||
      mimeType.includes("xml") ||
      mimeType.includes("csv") ||
      mimeType.includes("html") ||
      mimeType.includes("css") ||
      mimeType.includes("javascript") ||
      mimeType.includes("typescript");

    if (isPreviewable && url) {
      return (
        <div className="w-full h-full min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <FilePreview mimeType={mimeType} src={url} />
          </div>
          <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground bg-muted/20 rounded-lg p-2">
            <span>{new Date(file.uploadedAt).toLocaleString()}</span>
            <span>{Math.round(file.size / 1024)} KB</span>
          </div>
        </div>
      );
    }

    // For non-previewable file types
    return (
      <div className="flex flex-col justify-center items-center bg-muted/20 rounded-lg p-8 min-h-[400px]">
        <div className="text-center mb-6">
          <p className="text-lg font-medium mb-2">No Preview Available</p>
          <p className="text-sm text-muted-foreground">
            This file type cannot be previewed in the browser
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            File type: {mimeType}
          </p>
        </div>
        <Button onClick={() => onDownload(file.id)} className="mt-4">
          Download File
        </Button>
      </div>
    );
  };

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="bg-card/90 backdrop-blur-md border-gray-800 p-3 flex flex-col"
          style={{
            width: "75vw",
            height: "95vh",
            maxWidth: "75vw",
            maxHeight: "95vh",
          }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-center">{file.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            {renderPreviewContent()}
          </div>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden bg-card/30 backdrop-blur-md hover:bg-card/40 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {iconFor(file.mimeType, handleIconClick)}
              <div>
                <div
                  className="font-medium cursor-pointer hover:underline hover:text-primary transition-colors duration-200"
                  onClick={handleIconClick}
                >
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date} • {sizeKB} KB
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload(file.id)}>
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(file.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
