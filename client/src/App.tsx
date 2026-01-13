import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import AdminHome from "@/pages/admin-home";
import AdminUsers from "@/pages/admin-users";
import DriverHome from "@/pages/driver-home";
import Profile from "@/pages/profile";
import ChangePassword from "@/pages/change-password";
import NotFound from "@/pages/not-found";

// Protected Route Component
function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType, 
  allowedRoles?: ("ADMIN" | "DRIVER")[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.mustChangePassword && window.location.pathname !== "/change-password") {
    return <Redirect to="/change-password" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect to their appropriate home if accessing unauthorized route
    return <Redirect to={user.role === "ADMIN" ? "/admin/home" : "/driver/home"} />;
  }

  return <Component />;
}

// Extract Root Redirector to avoid inline function issues
function RootRedirector() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Redirect to="/login" />;
  if (user.mustChangePassword) return <Redirect to="/change-password" />;
  return <Redirect to={user.role === "ADMIN" ? "/admin/home" : "/driver/home"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      
      {/* Root redirect */}
      <Route path="/" component={RootRedirector} />

      {/* Protected Routes */}
      <Route path="/admin/home">
        <ProtectedRoute component={AdminHome} allowedRoles={["ADMIN"]} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={["ADMIN"]} />
      </Route>
      <Route path="/driver/home">
        <ProtectedRoute component={DriverHome} allowedRoles={["DRIVER"]} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      
      <Route path="/change-password">
        <ProtectedRoute component={ChangePassword} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
