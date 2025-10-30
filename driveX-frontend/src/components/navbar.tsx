"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Search } from "lucide-react";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

type Props = {
  onOpenProfile: () => void;
  onSearch: (q: string) => void;
};

export default function Navbar({ onOpenProfile, onSearch }: Props) {
  const [q, setQ] = React.useState("");
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <header className="w-full bg-card/30 backdrop-blur-md border-b border-gray-800">
      <div className="w-full px-6 py-6 flex items-center gap-4">
        <div
          className="font-bold text-6xl"
          style={{ fontFamily: "New Rocker, cursive", color: "#D97D55" }}
        >
          DriveX
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search files..."
              className="pl-8 border-gray-800"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 rounded-full focus-visible:outline-none">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">DX</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenProfile}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.replace("/auth");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
