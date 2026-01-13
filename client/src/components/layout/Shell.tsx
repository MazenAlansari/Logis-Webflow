import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  User, 
  Truck, 
  LayoutDashboard, 
  Menu,
  ShieldCheck,
  Settings,
  ChevronDown,
  Users as UsersIcon
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Define navigation based on role
  const getNavItems = () => {
    if (user?.role === "ADMIN") {
      return [
        { href: "/admin/home", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: UsersIcon },
        { href: "/admin/drivers", label: "Drivers", icon: Truck }, // Placeholder
        { href: "/admin/settings", label: "Settings", icon: Settings }, // Placeholder
      ];
    }
    if (user?.role === "DRIVER") {
      return [
        { href: "/driver/home", label: "My Tasks", icon: Truck },
        { href: "/driver/history", label: "History", icon: LayoutDashboard }, // Placeholder
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const NavContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
          L
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Logistics Ops</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
            {user?.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-card h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-20 px-4 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <NavContent />
              </SheetContent>
            </Sheet>
            <span className="font-display font-bold text-lg">Logistics Ops</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <span className="hidden sm:inline-block">{user?.fullName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/change-password">
                  <DropdownMenuItem className="cursor-pointer">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Security
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
