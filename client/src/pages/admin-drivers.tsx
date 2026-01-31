import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Plus, Search, Loader2 } from "lucide-react";
import {
  fetchContactsPaginated,
  activateContact,
  deactivateContact,
  type ContactDTO,
} from "@/api/contacts";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/pagination/PaginationControls";
import { CreateContactModal } from "@/components/contacts/CreateContactModal";
import { EditContactModal } from "@/components/contacts/EditContactModal";

export default function AdminDrivers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationTypeFilter, setOrganizationTypeFilter] = useState<"COMPANY" | "PARTNER" | "ALL">("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<ContactDTO | null>(null);
  const [activateDriverId, setActivateDriverId] = useState<string | null>(null);
  const [deactivateDriverId, setDeactivateDriverId] = useState<string | null>(null);

  // Fetch drivers (contacts with contactType = DRIVER) with pagination
  const {
    data: drivers = [],
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    refetch,
  } = usePagination(
    ["admin", "drivers"],
    (params) =>
      fetchContactsPaginated({
        ...params,
        contactType: "DRIVER", // Always filter by DRIVER
        organizationType:
          organizationTypeFilter !== "ALL"
            ? organizationTypeFilter
            : undefined,
        search: searchQuery || undefined,
      }),
    { defaultPage: 1, defaultLimit: 20 }
  );

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [organizationTypeFilter, searchQuery, refetch]);

  // Activate driver mutation
  const activateMutation = useMutation({
    mutationFn: (driverId: string) => activateContact(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast({
        title: "Driver activated",
        description: "Driver has been activated successfully.",
      });
      setActivateDriverId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to activate driver";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Deactivate driver mutation
  const deactivateMutation = useMutation({
    mutationFn: (driverId: string) => deactivateContact(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast({
        title: "Driver deactivated",
        description: "Driver has been deactivated successfully.",
      });
      setDeactivateDriverId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to deactivate driver";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (driver: ContactDTO) => {
    setSelectedDriver(driver);
    setEditModalOpen(true);
  };

  const handleActivate = (driverId: string) => {
    setActivateDriverId(driverId);
  };

  const handleDeactivate = (driverId: string) => {
    setDeactivateDriverId(driverId);
  };

  if (error) {
    return (
      <Shell>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading drivers. Please try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>
                  Manage drivers for companies and partners.
                </CardDescription>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={organizationTypeFilter}
                onValueChange={(value) =>
                  setOrganizationTypeFilter(value as "COMPANY" | "PARTNER" | "ALL")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Organization Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Organizations</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="PARTNER">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drivers found.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Name (AR)</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">
                            {driver.nameEn}
                          </TableCell>
                          <TableCell>{driver.nameAr}</TableCell>
                          <TableCell>
                            {driver.organization?.nameEn || "N/A"}
                          </TableCell>
                          <TableCell>{driver.mobile || "-"}</TableCell>
                          <TableCell>{driver.email || "-"}</TableCell>
                          <TableCell>{driver.nationality || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={driver.isActive ? "default" : "secondary"}
                            >
                              {driver.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(driver)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                {driver.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivate(driver.id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleActivate(driver.id)}
                                  >
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="mt-4">
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
      </div>

      {/* Modals */}
      <CreateContactModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
        }}
        defaultContactType="DRIVER"
        hideContactType={true}
        title="Create Driver"
        description="Add a new driver to the system."
        submitButtonText="Create Driver"
        successTitle="Driver created"
        successDescription="Driver has been created successfully."
        nameEnPlaceholder="Driver Name (EN)"
        nameArPlaceholder="اسم السائق"
      />
      <EditContactModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        contact={selectedDriver}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
        }}
        hideContactType={true}
        forceContactType="DRIVER"
        title="Edit Driver"
        description="Update driver information."
        submitButtonText="Update Driver"
        successTitle="Driver updated"
        successDescription="Driver has been updated successfully."
        nameEnPlaceholder="Driver Name (EN)"
        nameArPlaceholder="اسم السائق"
      />

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={activateDriverId !== null}
        onOpenChange={(open) => !open && setActivateDriverId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this driver?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activateDriverId) {
                  activateMutation.mutate(activateDriverId);
                }
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deactivateDriverId !== null}
        onOpenChange={(open) => !open && setDeactivateDriverId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this driver?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivateDriverId) {
                  deactivateMutation.mutate(deactivateDriverId);
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}
