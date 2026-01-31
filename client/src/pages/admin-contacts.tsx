import { useState, useMemo, useEffect } from "react";
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

const CONTACT_TYPES = [
  "DRIVER",
  "STAFF",
  "MANAGER",
  "CUSTOMER_SERVICE",
  "SALES",
  "ACCOUNTANT",
  "OTHER",
] as const;

export default function AdminContacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationTypeFilter, setOrganizationTypeFilter] = useState<"COMPANY" | "PARTNER" | "ALL">("ALL");
  const [contactTypeFilter, setContactTypeFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDTO | null>(null);
  const [activateContactId, setActivateContactId] = useState<string | null>(null);
  const [deactivateContactId, setDeactivateContactId] = useState<string | null>(null);

  // Fetch contacts with pagination
  const {
    data: contacts = [],
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    refetch,
  } = usePagination(
    ["admin", "contacts"],
    (params) =>
      fetchContactsPaginated({
        ...params,
        organizationType:
          organizationTypeFilter !== "ALL"
            ? organizationTypeFilter
            : undefined,
        contactType: contactTypeFilter !== "ALL" ? contactTypeFilter : undefined,
        search: searchQuery || undefined,
      }),
    { defaultPage: 1, defaultLimit: 20 }
  );

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [organizationTypeFilter, contactTypeFilter, searchQuery, refetch]);

  // Activate contact mutation
  const activateMutation = useMutation({
    mutationFn: (contactId: string) => activateContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      toast({
        title: "Contact activated",
        description: "Contact has been activated successfully.",
      });
      setActivateContactId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to activate contact";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Deactivate contact mutation
  const deactivateMutation = useMutation({
    mutationFn: (contactId: string) => deactivateContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      toast({
        title: "Contact deactivated",
        description: "Contact has been deactivated successfully.",
      });
      setDeactivateContactId(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to deactivate contact";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (contact: ContactDTO) => {
    setSelectedContact(contact);
    setEditModalOpen(true);
  };

  const handleActivate = (contactId: string) => {
    setActivateContactId(contactId);
  };

  const handleDeactivate = (contactId: string) => {
    setDeactivateContactId(contactId);
  };

  if (error) {
    return (
      <Shell>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading contacts. Please try again.
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
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  Manage contacts for companies and partners.
                </CardDescription>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search contacts..."
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
              <Select
                value={contactTypeFilter}
                onValueChange={setContactTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Contact Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {CONTACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contacts found.
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
                        <TableHead>Contact Type</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">
                            {contact.nameEn}
                          </TableCell>
                          <TableCell>{contact.nameAr}</TableCell>
                          <TableCell>
                            {contact.organization?.nameEn || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {contact.contactType.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{contact.mobile || "-"}</TableCell>
                          <TableCell>{contact.email || "-"}</TableCell>
                          <TableCell>{contact.nationality || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={contact.isActive ? "default" : "secondary"}
                            >
                              {contact.isActive ? "Active" : "Inactive"}
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
                                  onClick={() => handleEdit(contact)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                {contact.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivate(contact.id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleActivate(contact.id)}
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
          queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
        }}
      />
      <EditContactModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        contact={selectedContact}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
        }}
      />

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={activateContactId !== null}
        onOpenChange={(open) => !open && setActivateContactId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this contact?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activateContactId) {
                  activateMutation.mutate(activateContactId);
                }
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deactivateContactId !== null}
        onOpenChange={(open) => !open && setDeactivateContactId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this contact?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivateContactId) {
                  deactivateMutation.mutate(deactivateContactId);
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
