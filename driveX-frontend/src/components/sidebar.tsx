"use client";

import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Video,
  Music,
  FileText,
  FolderOpen,
  FileIcon,
} from "lucide-react";
import AnimatedStorage from "./animated-storage";

type Props = {
  active: string;
  onChange: (value: string) => void;
  storageUsed?: number;
  storageTotal?: number;
};

const items = [
  { key: "all", label: "All Files", icon: FolderOpen },
  { key: "image", label: "Images", icon: ImageIcon },
  { key: "video", label: "Videos", icon: Video },
  { key: "audio", label: "Audio", icon: Music },
  { key: "document", label: "Documents", icon: FileText },
  { key: "other", label: "Other Files", icon: FileIcon },
];

export default function Sidebar({
  active,
  onChange,
  storageUsed = 0,
  storageTotal = 0,
}: Props) {
  const pct =
    storageTotal > 0
      ? Math.min(100, Math.round((storageUsed / storageTotal) * 100))
      : 0;

  return (
    <aside className="w-full md:w-64 h-full bg-card/30 backdrop-blur-md border-r border-gray-800">
      <div className="p-4 grid gap-2">
        {items.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={active === key ? "default" : "secondary"}
            className="justify-start"
            onClick={() => onChange(key)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      <AnimatedStorage used={storageUsed} total={storageTotal} />
    </aside>
  );
}
