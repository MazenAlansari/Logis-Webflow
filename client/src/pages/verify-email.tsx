import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>;

// API functions
async function verifyEmailApi(token: string) {
  const res = await apiRequest("POST", api.auth.verifyEmail.path, { token });
  return res.json();
}

async function resendVerificationEmailApi() {
  const res = await apiRequest("POST", api.auth.resendVerificationEmail.path);
  return res.json();
}

export default function VerifyEmail() {
  const { user, isLoading: authLoading, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVerified, setIsVerified] = useState(false);

  // Get token from URL query parameter (from email link)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  const form = useForm<VerifyEmailForm>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: tokenFromUrl || "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => verifyEmailApi(token),
    onSuccess: async () => {
      setIsVerified(true);
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully.",
      });
      // Invalidate and refetch user query to get updated emailVerified status
      await queryClient.invalidateQueries({ queryKey: [api.auth.user.path] });
      await queryClient.refetchQueries({ queryKey: [api.auth.user.path] });
      // Redirect after brief delay
      setTimeout(() => {
        window.location.href = user?.role === "ADMIN" ? "/admin/home" : "/driver/home";
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to verify email. Token may be invalid or expired.";
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendVerificationEmailApi(),
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to resend verification email.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleVerifyToken = useCallback((token: string) => {
    verifyMutation.mutate(token);
  }, [verifyMutation]);

  const onSubmit = (data: VerifyEmailForm) => {
    handleVerifyToken(data.token);
  };

  const handleBackButton = () => {
    // Logout user and redirect to login page
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      },
    });
  };

  // If token is in URL, auto-submit on mount
  useEffect(() => {
    if (tokenFromUrl && !isVerified && !verifyMutation.isPending && !verifyMutation.isSuccess) {
      handleVerifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl, isVerified, verifyMutation.isPending, verifyMutation.isSuccess, handleVerifyToken]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // If user already verified, redirect to home
  if (user.emailVerified && !isVerified) {
    return user.role === "ADMIN" ? <Redirect to="/admin/home" /> : <Redirect to="/driver/home" />;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="-ml-2 h-8 w-8"
              onClick={handleBackButton}
              disabled={logoutMutation.isPending}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold font-display">Verify Email</CardTitle>
          </div>
          <CardDescription>
            Please verify your email address to continue using the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isVerified ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Email Verified!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your email has been verified successfully. Redirecting...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verification email sent to:</p>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Token</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter verification token from email"
                              {...field}
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription>
                            Check your email for the verification link or enter the token manually.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    Didn't receive the email?
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

