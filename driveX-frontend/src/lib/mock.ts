import type { FileItem } from "@/types/file";

const STORAGE_KEY = "drivex_mock_files_v1";

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const now = new Date().toISOString();
  const seed: FileItem[] = [
    // Documents
    {
      id: crypto.randomUUID(),
      name: "Design-Brief.pdf",
      size: 245_760,
      mimeType: "application/pdf",
      createdAt: now,
      url: "/pdf-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Project-Proposal.docx",
      size: 156_432,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Budget-Spreadsheet.xlsx",
      size: 89_123,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Meeting-Notes.txt",
      size: 8_192,
      mimeType: "text/plain",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Contract-Terms.pdf",
      size: 392_847,
      mimeType: "application/pdf",
      createdAt: now,
      url: "/pdf-document-preview-mock.jpg",
    },

    // Images
    {
      id: crypto.randomUUID(),
      name: "Team-Photo.jpg",
      size: 512_000,
      mimeType: "image/jpeg",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Logo-Design.png",
      size: 234_567,
      mimeType: "image/png",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Product-Shot-01.jpg",
      size: 1_234_567,
      mimeType: "image/jpeg",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Product-Shot-02.jpg",
      size: 1_145_678,
      mimeType: "image/jpeg",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Banner-Design.svg",
      size: 45_678,
      mimeType: "image/svg+xml",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Screenshot-Demo.png",
      size: 678_901,
      mimeType: "image/png",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Hero-Background.jpg",
      size: 2_345_678,
      mimeType: "image/jpeg",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Icon-Set.png",
      size: 123_456,
      mimeType: "image/png",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },

    // Videos
    {
      id: crypto.randomUUID(),
      name: "Promo-Clip.mp4",
      size: 4_194_304,
      mimeType: "video/mp4",
      createdAt: now,
      url: "/video-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Tutorial-Part-1.mp4",
      size: 15_728_640,
      mimeType: "video/mp4",
      createdAt: now,
      url: "/video-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Tutorial-Part-2.mp4",
      size: 18_432_123,
      mimeType: "video/mp4",
      createdAt: now,
      url: "/video-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Product-Demo.mov",
      size: 25_165_824,
      mimeType: "video/quicktime",
      createdAt: now,
      url: "/video-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Client-Testimonial.mp4",
      size: 8_388_608,
      mimeType: "video/mp4",
      createdAt: now,
      url: "/video-preview-mock.jpg",
    },

    // Audio
    {
      id: crypto.randomUUID(),
      name: "Podcast-Teaser.mp3",
      size: 1_572_864,
      mimeType: "audio/mpeg",
      createdAt: now,
      url: "/audio-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Background-Music.wav",
      size: 12_582_912,
      mimeType: "audio/wav",
      createdAt: now,
      url: "/audio-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Voiceover-Track.mp3",
      size: 3_145_728,
      mimeType: "audio/mpeg",
      createdAt: now,
      url: "/audio-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Sound-Effects.aiff",
      size: 2_097_152,
      mimeType: "audio/aiff",
      createdAt: now,
      url: "/audio-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Interview-Recording.m4a",
      size: 6_291_456,
      mimeType: "audio/mp4",
      createdAt: now,
      url: "/audio-preview-mock.jpg",
    },

    // More varied files
    {
      id: crypto.randomUUID(),
      name: "Presentation-Slides.pptx",
      size: 5_242_880,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Database-Backup.sql",
      size: 1_048_576,
      mimeType: "application/sql",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Config-File.json",
      size: 4_096,
      mimeType: "application/json",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Archive-Data.zip",
      size: 10_485_760,
      mimeType: "application/zip",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "Photoshop-Design.psd",
      size: 20_971_520,
      mimeType: "image/vnd.adobe.photoshop",
      createdAt: now,
      url: "/image-preview-mock.jpg",
    },
    {
      id: crypto.randomUUID(),
      name: "3D-Model.obj",
      size: 3_355_443,
      mimeType: "application/octet-stream",
      createdAt: now,
      url: "/text-document-preview-mock.jpg",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

function readAll(): FileItem[] {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FileItem[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: FileItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function mockListFiles(): Promise<FileItem[]> {
  return readAll();
}

export async function mockAddFiles(files: File[]): Promise<void> {
  const items = readAll();
  const now = new Date().toISOString();
  const additions: FileItem[] = files.map((f) => {
    const id = crypto.randomUUID();
    const mimeType = f.type || "application/octet-stream";
    let query = "file%20preview%20mock";
    if (mimeType.startsWith("image/")) query = "image%20preview%20mock";
    else if (mimeType.startsWith("video/")) query = "video%20preview%20mock";
    else if (mimeType.startsWith("audio/")) query = "audio%20preview%20mock";
    else if (mimeType.includes("pdf"))
      query = "pdf%20document%20preview%20mock";
    else if (mimeType.includes("text"))
      query = "text%20document%20preview%20mock";

    return {
      id,
      name: f.name || "Untitled",
      size: f.size || 0,
      mimeType,
      createdAt: now,
      url: `/placeholder.svg?height=600&width=800&query=${query}`,
    };
  });
  writeAll([...additions, ...items]);
}

export async function mockDeleteFile(id: string): Promise<void> {
  const items = readAll();
  writeAll(items.filter((f) => f.id !== id));
}

export async function mockGetFile(id: string): Promise<FileItem | null> {
  const items = readAll();
  return items.find((f) => f.id === id) ?? null;
}

export async function resetMockData(): Promise<void> {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  seedIfEmpty();
}
