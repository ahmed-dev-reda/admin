"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

function UsernameForm({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const [username, setUsername] = React.useState(initialUsername);
  const [usernameMsg, setUsernameMsg] = React.useState<string | null>(null);
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    setUsernameMsg(null);
    const value = username.trim();
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    }
    setIsSavingUsername(true);
    try {
      const { error } = await authClient.updateUser({
        username: value,
        displayUsername: value,
      });
      if (error) throw new Error(error.message ?? "Failed to update username");
      setUsernameMsg("Username updated successfully.");
      router.refresh();
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          Username
        </CardTitle>
        <CardDescription>
          This is the username you use to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              minLength={3}
              required
              disabled={isSavingUsername}
            />
          </div>
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
          {usernameMsg && (
            <p className="text-sm text-emerald-600">{usernameMsg}</p>
          )}
          <Button type="submit" disabled={isSavingUsername}>
            {isSavingUsername && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Save Username
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordMsg, setPasswordMsg] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message ?? "Failed to change password");
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-5" />
          Password
        </CardTitle>
        <CardDescription>
          Change your password. You will stay signed in on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              autoComplete="current-password"
              disabled={isSavingPassword}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isSavingPassword}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isSavingPassword}
            />
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          {passwordMsg && (
            <p className="text-sm text-emerald-600">{passwordMsg}</p>
          )}
          <Button type="submit" disabled={isSavingPassword}>
            {isSavingPassword && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) router.push("/auth/sign-in");
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as { username?: string; displayUsername?: string };
  const initialUsername = user.username ?? user.displayUsername ?? "";

  return (
    <section className="mx-auto max-w-2xl space-y-6 pb-8 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <UsernameForm key={session.user.id} initialUsername={initialUsername} />
      <PasswordForm />
    </section>
  );
}
