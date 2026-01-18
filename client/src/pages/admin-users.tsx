import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Shell from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { MoreVertical, Plus, Copy, Check, Search, Loader2, Mail, MailCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchUsers,
  fetchUsersPaginated,
  createUser,
  updateUser,
  resetPassword,
  sendWelcomeEmail,
  type UserDTO,
  type CreateUserRequest,
  type UpdateUserRequest,
  type SendWelcomeEmailRequest,
} from "@/api/adminUsers";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/pagination/PaginationControls";

// Form schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["ADMIN", "DRIVER"]).default("DRIVER"),
  isActive: z.boolean().default(true),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["ADMIN", "DRIVER"]),
  isActive: z.boolean(),
});

const changeEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type UpdateUserForm = z.infer<typeof updateUserSchema>;
type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

// Temp Password Dialog Component
function TempPasswordDialog({
  open,
  onOpenChange,
  tempPassword,
  userName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempPassword: string;
  userName: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Temporary Password</DialogTitle>
          <DialogDescription>
            Temporary password for {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={tempPassword}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Copy now. You won't be able to view it again.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create User Modal Component
function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
  onUserCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (tempPassword: string, userName: string) => void;
  onUserCreated?: (userId: string, tempPassword: string) => void;
}) {
  const { toast } = useToast();
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "DRIVER",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: (response) => {
      toast({
        title: "User created",
        description: "User has been created successfully.",
      });
      onSuccess(response.tempPassword, response.fullName);
      // Store temp password for send welcome email feature
      if (onUserCreated) {
        onUserCreated(response.id, response.tempPassword);
      }
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to create user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. A temporary password will be generated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRIVER">Driver</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      User can log in to the system
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Change Email Modal Component
function ChangeEmailModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDTO | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.username,
      });
    }
  }, [user, form]);

  const changeEmailMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(user!.id, data),
    onSuccess: () => {
      toast({
        title: "Email updated",
        description: "User email has been updated successfully.",
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update email";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChangeEmailForm) => {
    changeEmailMutation.mutate({ email: data.email });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Update email address for {user.fullName}. The user will need to use the new email to log in.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Modal Component
function EditUserModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDTO | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      role: user?.role || "DRIVER",
      isActive: user?.isActive ?? true,
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(user!.id, data),
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserForm) => {
    updateMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRIVER">Driver</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      User can log in to the system
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [changeEmailUser, setChangeEmailUser] = useState<UserDTO | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDTO | null>(null);
  const [tempPasswordDialogOpen, setTempPasswordDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [tempPasswordUserName, setTempPasswordUserName] = useState("");
  // Store temp passwords by userId (from create/reset password responses)
  const [tempPasswordsByUserId, setTempPasswordsByUserId] = useState<Record<string, string>>({});

  // Fetch users with pagination (default limit: 5 for users)
  const {
    data: users = [],
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
  } = usePagination(
    ["admin", "users"],
    fetchUsersPaginated,
    { defaultPage: 1, defaultLimit: 5 }
  );

  // Filter users by search query (client-side for now)
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => resetPassword(userId),
    onSuccess: (response, userId) => {
      const user = users.find((u) => u.id === userId);
      setTempPassword(response.tempPassword);
      setTempPasswordUserName(user?.fullName || "User");
      setTempPasswordDialogOpen(true);
      setResetPasswordUser(null);
      // Store temp password for later use in send welcome email
      setTempPasswordsByUserId((prev) => ({
        ...prev,
        [userId]: response.tempPassword,
      }));
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Password reset",
        description: "Password has been reset successfully.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to reset password";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUser(userId, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "User updated",
        description: "User status has been updated.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Send welcome email mutation
  const sendWelcomeEmailMutation = useMutation({
    mutationFn: (data: SendWelcomeEmailRequest) => sendWelcomeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Welcome email sent",
        description: "Welcome email sent successfully.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to send welcome email.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSuccess = (tempPwd: string, userName: string) => {
    setTempPassword(tempPwd);
    setTempPasswordUserName(userName);
    setTempPasswordDialogOpen(true);
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const handleUserCreated = (userId: string, tempPwd: string) => {
    // Store temp password for send welcome email feature
    setTempPasswordsByUserId((prev) => ({
      ...prev,
      [userId]: tempPwd,
    }));
  };

  const handleSendWelcomeEmail = (user: UserDTO) => {
    // Check if temp password is available
    const tempPwd = tempPasswordsByUserId[user.id];
    if (!tempPwd) {
      toast({
        title: "Error",
        description: "Temp password is not available. Please reset password to resend welcome email.",
        variant: "destructive",
      });
      return;
    }

    // Send welcome email
    sendWelcomeEmailMutation.mutate({
      userId: user.id,
      tempPassword: tempPwd,
    });
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const handleEdit = (user: UserDTO) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleChangeEmail = (user: UserDTO) => {
    setChangeEmailUser(user);
    setChangeEmailModalOpen(true);
  };

  const handleChangeEmailSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const handleResetPassword = (user: UserDTO) => {
    setResetPasswordUser(user);
  };

  const confirmResetPassword = () => {
    if (resetPasswordUser) {
      resetPasswordMutation.mutate(resetPasswordUser.id);
    }
  };

  const handleToggleActive = (user: UserDTO) => {
    toggleActiveMutation.mutate({
      userId: user.id,
      isActive: !user.isActive,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return format(new Date(date), "MMM d, yyyy");
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.id === userId;
  };

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage system access (Admin creates users; no public registration).
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Search and manage all system users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Failed to load users. Please try again.
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No users found matching your search." : "No users found."}
              </div>
            )}

            {/* Users Table */}
            {!isLoading && !error && filteredUsers.length > 0 && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Must Change Password</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.mustChangePassword ? "destructive" : "outline"}>
                              {user.mustChangePassword ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.lastLoginAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                  Edit user
                                </DropdownMenuItem>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="w-full">
                                        <DropdownMenuItem 
                                          onClick={() => handleChangeEmail(user)}
                                          disabled={isCurrentUser(user.id)}
                                          onSelect={(e) => {
                                            if (isCurrentUser(user.id)) {
                                              e.preventDefault();
                                            }
                                          }}
                                          className="w-full"
                                        >
                                          <MailCheck className="mr-2 h-4 w-4" />
                                          Change Email
                                        </DropdownMenuItem>
                                      </div>
                                    </TooltipTrigger>
                                    {isCurrentUser(user.id) && (
                                      <TooltipContent side="left">
                                        You cannot change your own email address
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                                <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                  Reset password
                                </DropdownMenuItem>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="w-full">
                                        <DropdownMenuItem
                                          onClick={() => handleSendWelcomeEmail(user)}
                                          disabled={
                                            !user.mustChangePassword ||
                                            !user.isActive ||
                                            sendWelcomeEmailMutation.isPending ||
                                            !tempPasswordsByUserId[user.id]
                                          }
                                          onSelect={(e) => {
                                            if (
                                              !user.mustChangePassword ||
                                              !user.isActive ||
                                              !tempPasswordsByUserId[user.id]
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          className="w-full"
                                        >
                                          {sendWelcomeEmailMutation.isPending ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="mr-2 h-4 w-4" />
                                              Send Welcome Email
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      </div>
                                    </TooltipTrigger>
                                    {(!user.mustChangePassword || !user.isActive || !tempPasswordsByUserId[user.id]) && (
                                      <TooltipContent side="left">
                                        {!user.mustChangePassword
                                          ? "User already changed password"
                                          : !user.isActive
                                          ? "User is inactive"
                                          : "Temp password is not available. Please reset password to resend welcome email."}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(user)}
                                  disabled={isCurrentUser(user.id) && user.isActive}
                                  onSelect={(e) => {
                                    if (isCurrentUser(user.id) && user.isActive) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {pagination && (
                  <PaginationControls
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    limitOptions={[5, 10, 15, 20]}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />

      <ChangeEmailModal
        open={changeEmailModalOpen}
        onOpenChange={setChangeEmailModalOpen}
        user={changeEmailUser}
        onSuccess={handleChangeEmailSuccess}
      />

      <TempPasswordDialog
        open={tempPasswordDialogOpen}
        onOpenChange={setTempPasswordDialogOpen}
        tempPassword={tempPassword}
        userName={tempPasswordUserName}
      />

      {/* Reset Password Confirmation */}
      <AlertDialog
        open={!!resetPasswordUser}
        onOpenChange={(open) => !open && setResetPasswordUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Reset password for {resetPasswordUser?.fullName}? A new temporary password will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}

