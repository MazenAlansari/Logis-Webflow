import Shell from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Shield, Mail, User as UserIcon } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-blue-600" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-6 gap-6 px-4">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-secondary">
                  {user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 mb-2">
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Active Account</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-4 pb-6">
              <div className="grid gap-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Full Name
                </label>
                <div className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                  {user.fullName}
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <div className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                  {user.username}
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Role & Permissions
                </label>
                <div className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                  {user.role === 'ADMIN' ? 'Full System Access' : 'Driver Application Access'}
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">Manage your password and authentication methods</p>
                </div>
                <Link href="/change-password">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
