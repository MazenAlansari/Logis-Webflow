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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreVertical, Plus, Search, Loader2 } from "lucide-react";
import {
  fetchPartnersPaginated,
  createPartner,
  updatePartner,
  activatePartner,
  deactivatePartner,
  deletePartner,
  type PartnerDTO,
  type CreatePartnerRequest,
  type UpdatePartnerRequest,
} from "@/api/partners";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/pagination/PaginationControls";

// Form schemas
const createPartnerSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  notes: z.string().optional(),
});

const updatePartnerSchema = z.object({
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().min(1, "Arabic name is required").optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type CreatePartnerForm = z.infer<typeof createPartnerSchema>;
type UpdatePartnerForm = z.infer<typeof updatePartnerSchema>;

// Create Partner Modal Component
function CreatePartnerModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<CreatePartnerForm>({
    resolver: zodResolver(createPartnerSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      taxId: "",
      registrationNumber: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePartnerRequest) => createPartner(data),
    onSuccess: () => {
      toast({
        title: "Partner created",
        description: "Partner has been created successfully.",
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.message || "Failed to create partner";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePartnerForm) => {
    const requestData: CreatePartnerRequest = {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      taxId: data.taxId || undefined,
      registrationNumber: data.registrationNumber || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
    };
    createMutation.mutate(requestData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Partner</DialogTitle>
          <DialogDescription>
            Add a new partner to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Partner Name (EN)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arabic Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الشريك" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Registration Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes" {...field} />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Partner
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Partner Modal Component
function EditPartnerModal({
  open,
  onOpenChange,
  partner,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: PartnerDTO | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<UpdatePartnerForm>({
    resolver: zodResolver(updatePartnerSchema),
    defaultValues: {
      nameEn: partner?.nameEn || "",
      nameAr: partner?.nameAr || "",
      taxId: partner?.taxId || "",
      registrationNumber: partner?.registrationNumber || "",
      address: partner?.address || "",
      city: partner?.city || "",
      country: partner?.country || "",
      phone: partner?.phone || "",
      email: partner?.email || "",
      notes: partner?.notes || "",
    },
  });

  // Update form when partner changes
  useEffect(() => {
    if (partner) {
      form.reset({
        nameEn: partner.nameEn,
        nameAr: partner.nameAr,
        taxId: partner.taxId || "",
        registrationNumber: partner.registrationNumber || "",
        address: partner.address || "",
        city: partner.city || "",
        country: partner.country || "",
        phone: partner.phone || "",
        email: partner.email || "",
        notes: partner.notes || "",
      });
    }
  }, [partner, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePartnerRequest) =>
      updatePartner(partner!.id, data),
    onSuccess: () => {
      toast({
        title: "Partner updated",
        description: "Partner has been updated successfully.",
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update partner";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdatePartnerForm) => {
    const requestData: UpdatePartnerRequest = {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      taxId: data.taxId || undefined,
      registrationNumber: data.registrationNumber || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
    };
    updateMutation.mutate(requestData);
  };

  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
          <DialogDescription>
            Update partner information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Partner Name (EN)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arabic Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الشريك" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Registration Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes" {...field} />
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Partner
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPartners() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
  const [activatePartnerId, setActivatePartnerId] = useState<string | null>(null);
  const [deactivatePartnerId, setDeactivatePartnerId] = useState<string | null>(null);
  const [deletePartnerId, setDeletePartnerId] = useState<string | null>(null);

  // Fetch partners with pagination (default limit: 20 for partners)
  const {
    data: partners = [],
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
  } = usePagination(
    ["admin", "partners"],
    fetchPartnersPaginated,
    { defaultPage: 1, defaultLimit: 20 }
  );

  // Filter partners by search query (client-side for now)
  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    const query = searchQuery.toLowerCase();
    return partners.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(query) ||
        p.nameAr.toLowerCase().includes(query) ||
        (p.city && p.city.toLowerCase().includes(query)) ||
        (p.country && p.country.toLowerCase().includes(query))
    );
  }, [partners, searchQuery]);

  // Activate partner mutation
  const activateMutation = useMutation({
    mutationFn: (partnerId: string) => activatePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast({
        title: "Partner activated",
        description: "Partner has been activated successfully.",
      });
      setActivatePartnerId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to activate partner";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Deactivate partner mutation
  const deactivateMutation = useMutation({
    mutationFn: (partnerId: string) => deactivatePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast({
        title: "Partner deactivated",
        description: "Partner has been deactivated successfully.",
      });
      setDeactivatePartnerId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to deactivate partner";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: (partnerId: string) => deletePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast({
        title: "Partner deleted",
        description: "Partner has been deleted permanently.",
      });
      setDeletePartnerId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to delete partner";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (partner: PartnerDTO) => {
    setSelectedPartner(partner);
    setEditModalOpen(true);
  };

  const handleActivate = (partnerId: string) => {
    setActivatePartnerId(partnerId);
  };

  const handleDeactivate = (partnerId: string) => {
    setDeactivatePartnerId(partnerId);
  };

  const handleDelete = (partnerId: string) => {
    setDeletePartnerId(partnerId);
  };

  if (error) {
    return (
      <Shell>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading partners: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partners</CardTitle>
              <CardDescription>
                Manage your business partners (customers and vendors).
              </CardDescription>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Partner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search partners by name, city, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No partners found matching your search." : "No partners found."}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name (EN)</TableHead>
                      <TableHead>Name (AR)</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.nameEn}</TableCell>
                        <TableCell>{partner.nameAr}</TableCell>
                        <TableCell>{partner.city || "-"}</TableCell>
                        <TableCell>{partner.country || "-"}</TableCell>
                        <TableCell>{partner.phone || "-"}</TableCell>
                        <TableCell>{partner.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={partner.isActive ? "default" : "secondary"}>
                            {partner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(partner)}>
                                Edit
                              </DropdownMenuItem>
                              {partner.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivate(partner.id)}
                                  className="text-orange-600"
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleActivate(partner.id)}
                                  className="text-green-600"
                                >
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(partner.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {!searchQuery && pagination && (
                <div className="mt-6">
                  <PaginationControls
                    page={page}
                    limit={limit}
                    total={pagination.total}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Partner Modal */}
      <CreatePartnerModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
        }}
      />

      {/* Edit Partner Modal */}
      <EditPartnerModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        partner={selectedPartner}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
          setSelectedPartner(null);
        }}
      />

      {/* Activate Confirmation Dialog */}
      <AlertDialog
        open={activatePartnerId !== null}
        onOpenChange={(open) => !open && setActivatePartnerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this partner?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activatePartnerId) {
                  activateMutation.mutate(activatePartnerId);
                }
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={deactivatePartnerId !== null}
        onOpenChange={(open) => !open && setDeactivatePartnerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this partner? This will set the partner as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivatePartnerId) {
                  deactivateMutation.mutate(deactivatePartnerId);
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletePartnerId !== null}
        onOpenChange={(open) => !open && setDeletePartnerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this partner? This action cannot be undone and will permanently remove the partner from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePartnerId) {
                  deleteMutation.mutate(deletePartnerId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}
