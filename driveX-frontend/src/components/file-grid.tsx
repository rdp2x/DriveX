"use client"

import type { FileItem } from "@/types/file"
import FileCard from "./file-card"

type Props = {
  files: FileItem[]
  onDelete: (id: string) => void
  onDownload: (id: string) => void
}

export default function FileGrid({ files, onDelete, onDownload }: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((f) => (
        <FileCard key={f.id} file={f} onDelete={onDelete} onDownload={onDownload} />
      ))}
    </div>
  )
}
