"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: Props) {
  const { logout } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const payload = {
      currentPassword: String(form.get("currentPassword") || ""),
      newPassword: String(form.get("newPassword") || ""),
      confirmPassword: String(form.get("confirmPassword") || ""),
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || ""
      const res = await fetch(`${base}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Failed to update password")
      }
      onOpenChange(false)
    } catch (e: any) {
      setError(e.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="text-sm text-muted-foreground">
              {/* Replace with actual user info when backend is connected */}
              <div>Username: user</div>
              <div>Email: user@example.com</div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <form className="grid gap-3" onSubmit={changePassword}>
              <div className="grid gap-1">
                <label className="text-sm">Current Password</label>
                <Input name="currentPassword" type="password" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">New Password</label>
                <Input name="newPassword" type="password" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Confirm New Password</label>
                <Input name="confirmPassword" type="password" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="theme" className="mt-4">
            <p className="text-sm text-muted-foreground">Theme toggling coming soon.</p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4">
          <div />
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
