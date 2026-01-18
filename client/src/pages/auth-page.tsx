import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Truck, Box } from "lucide-react";
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

export default function AuthPage() {
  const { user, loginMutation } = useAuth();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect logic if already logged in
  if (user) {
    if (user.mustChangePassword) {
      return <Redirect to="/change-password" />;
    }
    if (!user.emailVerified) {
      return <Redirect to="/verify-email" />;
    }
    if (user.role === "ADMIN") {
      return <Redirect to="/admin/home" />;
    }
    return <Redirect to="/driver/home" />;
  }

  const onSubmit = (data: LoginRequest) => {
    // Trim password to remove accidental leading/trailing spaces from copy-paste
    const trimmedData = {
      ...data,
      password: data.password.trim(),
    };
    loginMutation.mutate(trimmedData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold font-display tracking-tight">
            <div className="w-10 h-10 bg-white text-primary rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            Logistics Ops
          </div>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-5xl font-display font-bold leading-tight">
            Manage your fleet with precision.
          </h1>
          <p className="text-xl text-primary-foreground/80 font-light">
            Real-time tracking, automated dispatch, and comprehensive analytics for modern logistics teams.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-60">
          © 2024 Logistics Ops Inc. All rights reserved.
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-lg rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold font-display">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@company.com" 
                          {...field} 
                          className="h-12 text-base bg-muted/30" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="h-12 text-base bg-muted/30" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              Don't have an account? Contact your system administrator.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
