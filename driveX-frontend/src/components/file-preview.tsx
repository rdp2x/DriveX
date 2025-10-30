"use client";

type Props = {
  mimeType: string;
  src: string;
};

export default function FilePreview({ mimeType, src }: Props) {
  // Images
  if (mimeType.startsWith("image/")) {
    return (
      <div className="w-full h-full min-h-0 flex items-center justify-center">
        <img
          src={src || "/placeholder.svg"}
          alt="File preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
      </div>
    );
  }

  // Videos
  if (mimeType.startsWith("video/")) {
    return (
      <div className="w-full h-full min-h-0">
        <video
          controls
          src={src}
          className="w-full h-full rounded-lg shadow-lg object-contain bg-black"
          preload="metadata"
        >
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  // Audio
  if (mimeType.startsWith("audio/")) {
    return (
      <div className="flex flex-col items-center bg-muted/20 rounded-lg p-8">
        <div className="mb-4 text-4xl">🎵</div>
        <audio controls className="w-full max-w-md">
          <source src={src} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // PDFs
  if (mimeType.includes("pdf")) {
    return (
      <div className="w-full h-full min-h-0 bg-white rounded-lg overflow-hidden">
        <iframe
          src={`${src}#view=FitH`}
          className="w-full h-full border-0"
          title="PDF preview"
          loading="lazy"
          style={{
            minHeight: "100%",
            backgroundColor: "white",
          }}
        />
      </div>
    );
  }

  // Text files (including code files)
  if (
    mimeType.includes("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("csv") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript")
  ) {
    return (
      <div className="w-full h-full min-h-0 flex flex-col">
        <iframe
          src={src}
          className="w-full flex-1 rounded-lg border border-border bg-background"
          title="Text file preview"
          loading="lazy"
        />
      </div>
    );
  }

  // Office documents (basic iframe support)
  if (
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("officedocument")
  ) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center bg-muted/20 rounded-lg p-8 min-h-[400px] justify-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">Office Document</p>
          <p className="text-sm text-muted-foreground text-center">
            Office documents require download for proper viewing
          </p>
          <a
            href={src}
            download
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Download File
          </a>
        </div>
      </div>
    );
  }

  // Default fallback for unsupported file types
  return (
    <div className="flex flex-col items-center bg-muted/20 rounded-lg p-8 min-h-[400px] justify-center">
      <p className="text-lg font-medium mb-2">Preview Not Available</p>
      <p className="text-sm text-muted-foreground text-center mb-4">
        This file type cannot be previewed in the browser.
        <br />
        Click the download button below to view the file.
      </p>
      <p className="text-xs text-muted-foreground mb-4">Type: {mimeType}</p>
      <a
        href={src}
        download
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Download File
      </a>
    </div>
  );
}
