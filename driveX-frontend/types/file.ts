export type FileKind = "image" | "video" | "audio" | "document" | "other"

export type FileItem = {
  id: string
  name: string
  size: number
  mimeType: string
  createdAt: string
  url?: string // optional preview/download URL
  kind?: FileKind // derived client-side from mimeType
}
