import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordRequest } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function ChangePassword() {
  const { user, changePasswordMutation } = useAuth();

  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  // After password change: redirect based on verification status
  // This check runs after mutation success and user query has been refetched
  // Note: user object may still be stale, but the ProtectedRoute will handle the redirect
  // based on the actual user state after refetch

  const onSubmit = (data: ChangePasswordRequest) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            {!user.mustChangePassword && (
              <Link href={user.role === 'ADMIN' ? '/admin/home' : '/driver/home'}>
                <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <CardTitle className="text-2xl font-bold font-display">Change Password</CardTitle>
          </div>
          <CardDescription>
            {user.mustChangePassword 
              ? "For security reasons, you must change your password before continuing."
              : "Update your password to keep your account secure."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                {user.mustChangePassword && (
                  <Button 
                    variant="ghost" 
                    type="button" 
                    className="w-full"
                    onClick={() => useAuth().logoutMutation.mutate()}
                  >
                    Log Out
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
