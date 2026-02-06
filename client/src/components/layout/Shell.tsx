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
  ChevronRight,
  Users as UsersIcon,
  Handshake,
  Building2,
  UserCircle,
  UserCog,
  Building
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Define navigation categories for ADMIN
  const getAdminNavCategories = (): NavCategory[] => {
    return [
      {
        id: "user-management",
        label: t("navigation.userManagement") || "User Management",
        icon: UserCog,
        items: [
          { href: "/admin/users", label: t("navigation.users"), icon: UsersIcon },
          { href: "/admin/contacts", label: t("navigation.contacts"), icon: UserCircle },
          { href: "/admin/drivers", label: t("navigation.drivers"), icon: Truck },
        ],
      },
      {
        id: "organization-management",
        label: t("navigation.organizations") || "Organizations",
        icon: Building,
        items: [
          { href: "/admin/partners", label: t("navigation.partners"), icon: Handshake },
          { href: "/admin/company", label: t("navigation.company"), icon: Building2 },
        ],
      },
      {
        id: "configuration",
        label: t("navigation.configuration") || "Configuration",
        icon: Settings,
        items: [
          { href: "/admin/settings", label: t("navigation.settings"), icon: Settings },
        ],
      },
    ];
  };

  // Check if any item in a category is active
  const isCategoryActive = (category: NavCategory): boolean => {
    return category.items.some((item) => location === item.href);
  };

  // Get initial open state for categories (open if any child is active)
  const getInitialOpenState = (category: NavCategory): boolean => {
    return isCategoryActive(category);
  };

  // State for collapsible sections - only one category can be open at a time
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // Initialize open state based on active routes (auto-open category with active item)
  useEffect(() => {
    if (user?.role === "ADMIN") {
      const categories = getAdminNavCategories();
      const activeCategory = categories.find((category) => isCategoryActive(category));
      if (activeCategory) {
        setOpenCategoryId(activeCategory.id);
      }
    }
  }, [location, user?.role]);

  // Handle category toggle - only one category can be open at a time
  const handleCategoryToggle = (categoryId: string, isOpen: boolean) => {
    if (isOpen) {
      // Opening a category: close all others by setting only this one as open
      setOpenCategoryId(categoryId);
    } else {
      // Closing a category: set to null (no category open)
      setOpenCategoryId(null);
    }
  };

  // Define navigation for DRIVER (simple list)
  const getDriverNavItems = (): NavItem[] => {
    return [
      { href: "/driver/home", label: t("navigation.home"), icon: Truck },
      { href: "/driver/history", label: "History", icon: LayoutDashboard },
    ];
  };

  const NavContent = () => {
    // Admin navigation with categories
    if (user?.role === "ADMIN") {
      const categories = getAdminNavCategories();
      
      return (
        <div className="flex flex-col h-full py-4">
          <div className="px-6 mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
              L
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Logistics Ops</span>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {/* Dashboard - Always visible */}
            <Link href="/admin/home">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer mb-2",
                  location === "/admin/home"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className={cn("w-5 h-5", location === "/admin/home" ? "text-primary" : "text-muted-foreground")} />
                {t("navigation.dashboard")}
              </div>
            </Link>

            {/* Categories with collapsible sections - only one open at a time */}
            {categories.map((category) => {
              const categoryHasActiveItem = isCategoryActive(category);
              const isOpen = openCategoryId === category.id;

              return (
                <Collapsible
                  key={category.id}
                  open={isOpen}
                  onOpenChange={(open) => handleCategoryToggle(category.id, open)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
                      categoryHasActiveItem
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className={cn("w-5 h-5", categoryHasActiveItem ? "text-primary" : "text-muted-foreground")} />
                      <span>{category.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1 space-y-1">
                    {category.items.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.label}
                          </div>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
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
    }

    // Driver navigation - simple list
    if (user?.role === "DRIVER") {
      const navItems = getDriverNavItems();
      
      return (
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
    }

    return null;
  };

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
              <SheetContent side={i18n.language === 'ar' ? "right" : "left"} className="p-0 w-64">
                <NavContent />
              </SheetContent>
            </Sheet>
            <span className="font-display font-bold text-lg">Logistics Ops</span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
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
                    {t("navigation.profile")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/change-password">
                  <DropdownMenuItem className="cursor-pointer">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t("password.changePassword")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("navigation.logout")}
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
