import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Shell from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Edit2, Save, X } from "lucide-react";
import {
  fetchCompany,
  createCompany,
  updateCompany,
  type CompanyDTO,
  type CreateCompanyRequest,
  type UpdateCompanyRequest,
} from "@/api/company";

// Form schemas
const companySchema = z.object({
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

type CompanyForm = z.infer<typeof companySchema>;

export default function AdminCompany() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch company data
  const { data: company, isLoading, error } = useQuery<CompanyDTO>({
    queryKey: ["company"],
    queryFn: fetchCompany,
    retry: false,
  });

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
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

  // Create mutation (if company doesn't exist)
  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyRequest) => createCompany(data),
    onSuccess: () => {
      toast({
        title: "Company created",
        description: "Company information has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to create company";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCompanyRequest) => updateCompany(data),
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "Company information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update company";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Calculate derived values (before any conditional returns)
  // If company doesn't exist, show create form
  // Check if error message contains 404 or "not found"
  const showCreateForm = !company && error && (
    String((error as any)?.message || "").includes("404") || 
    String((error as any)?.message || "").toLowerCase().includes("not found")
  );

  const isLoadingMutation = createMutation.isPending || updateMutation.isPending;

  // Update form when company data loads
  useEffect(() => {
    if (company && !isEditing) {
      form.reset({
        nameEn: company.nameEn,
        nameAr: company.nameAr,
        taxId: company.taxId || "",
        registrationNumber: company.registrationNumber || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        phone: company.phone || "",
        email: company.email || "",
        notes: company.notes || "",
      });
    }
  }, [company, isEditing, form]);

  // Auto-enable editing if company doesn't exist
  useEffect(() => {
    if (showCreateForm && !isEditing) {
      setIsEditing(true);
    }
  }, [showCreateForm, isEditing]);

  // All hooks are now called - safe to do conditional returns
  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Shell>
    );
  }

  const onSubmit = (data: CompanyForm) => {
    const requestData: CreateCompanyRequest | UpdateCompanyRequest = {
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

    if (company) {
      // Update existing company
      updateMutation.mutate(requestData);
    } else {
      // Create new company
      createMutation.mutate(requestData as CreateCompanyRequest);
    }
  };

  const handleCancel = () => {
    if (company) {
      // Reset to original values
      form.reset({
        nameEn: company.nameEn,
        nameAr: company.nameAr,
        taxId: company.taxId || "",
        registrationNumber: company.registrationNumber || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        phone: company.phone || "",
        email: company.email || "",
        notes: company.notes || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <Shell>
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  {company
                    ? "Manage your company information"
                    : "Create your company information"}
                </CardDescription>
              </div>
              {company && !isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
                          <Input
                            placeholder="Company Name (EN)"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            placeholder="اسم الشركة"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            placeholder="Tax ID"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            placeholder="Registration Number"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                        <Input
                          placeholder="Address"
                          {...field}
                          disabled={!isEditing && !showCreateForm}
                        />
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
                          <Input
                            placeholder="City"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            placeholder="Country"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            placeholder="Phone"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                            disabled={!isEditing && !showCreateForm}
                          />
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
                        <Input
                          placeholder="Notes"
                          {...field}
                          disabled={!isEditing && !showCreateForm}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(isEditing || showCreateForm) && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoadingMutation}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoadingMutation}>
                      {isLoadingMutation && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      {company ? "Update" : "Create"} Company
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
