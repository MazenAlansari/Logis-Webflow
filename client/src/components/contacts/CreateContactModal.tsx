import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  createContact,
  fetchPartners,
  fetchCompany,
  type CreateContactRequest,
} from "@/api/contacts";
import type { PartnerDTO } from "@/api/partners";
import type { CompanyDTO } from "@/api/company";

const CONTACT_TYPES = [
  "DRIVER",
  "STAFF",
  "MANAGER",
  "CUSTOMER_SERVICE",
  "SALES",
  "ACCOUNTANT",
  "OTHER",
] as const;

// Form schema
const createContactSchema = z.object({
  organizationType: z.enum(["COMPANY", "PARTNER"]),
  organizationId: z.string().uuid("Organization is required"),
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  contactType: z.enum([
    "DRIVER",
    "STAFF",
    "MANAGER",
    "CUSTOMER_SERVICE",
    "SALES",
    "ACCOUNTANT",
    "OTHER",
  ]),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  nationality: z.string().optional(),
  notes: z.string().optional(),
});

type CreateContactForm = z.infer<typeof createContactSchema>;

export type CreateContactModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  // Customization props
  defaultContactType?: typeof CONTACT_TYPES[number];
  hideContactType?: boolean;
  title?: string;
  description?: string;
  submitButtonText?: string;
  successTitle?: string;
  successDescription?: string;
  nameEnPlaceholder?: string;
  nameArPlaceholder?: string;
};

export function CreateContactModal({
  open,
  onOpenChange,
  onSuccess,
  defaultContactType = "STAFF",
  hideContactType = false,
  title = "Create Contact",
  description = "Add a new contact to the system.",
  submitButtonText = "Create Contact",
  successTitle = "Contact created",
  successDescription = "Contact has been created successfully.",
  nameEnPlaceholder = "Contact Name (EN)",
  nameArPlaceholder = "اسم جهة الاتصال",
}: CreateContactModalProps) {
  const { toast } = useToast();
  const [organizationType, setOrganizationType] = useState<"COMPANY" | "PARTNER">("PARTNER");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch partners and company
  const { data: partners = [], isLoading: partnersLoading } = useQuery<PartnerDTO[]>({
    queryKey: ["partners"],
    queryFn: fetchPartners,
    enabled: open && organizationType === "PARTNER",
  });

  const { data: company, isLoading: companyLoading } = useQuery<CompanyDTO>({
    queryKey: ["company"],
    queryFn: fetchCompany,
    enabled: open && organizationType === "COMPANY",
  });

  // Auto-set company ID when COMPANY is selected
  useEffect(() => {
    if (organizationType === "COMPANY" && company) {
      setCompanyId(company.id);
      form.setValue("organizationId", company.id);
    } else {
      setCompanyId(null);
      form.setValue("organizationId", "");
    }
  }, [organizationType, company]);

  const form = useForm<CreateContactForm>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      organizationType: "PARTNER",
      organizationId: "",
      nameEn: "",
      nameAr: "",
      contactType: defaultContactType,
      mobile: "",
      email: "",
      nationality: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactRequest) => createContact(data),
    onSuccess: () => {
      toast({
        title: successTitle,
        description: successDescription,
      });
      form.reset({
        organizationType: "PARTNER",
        organizationId: "",
        nameEn: "",
        nameAr: "",
        contactType: defaultContactType,
        mobile: "",
        email: "",
        nationality: "",
        notes: "",
      });
      setOrganizationType("PARTNER");
      setCompanyId(null);
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.message || "Failed to create contact";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateContactForm) => {
    const requestData: CreateContactRequest = {
      organizationId: data.organizationId,
      contactType: hideContactType ? defaultContactType : data.contactType, // Use defaultContactType if hidden
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      mobile: data.mobile || undefined,
      email: data.email || undefined,
      nationality: data.nationality || undefined,
      notes: data.notes || undefined,
    };
    createMutation.mutate(requestData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Organization Selection */}
            <div className="space-y-3">
              <FormLabel>Organization Type *</FormLabel>
              <RadioGroup
                value={organizationType}
                onValueChange={(value) => {
                  setOrganizationType(value as "COMPANY" | "PARTNER");
                  form.setValue("organizationType", value as "COMPANY" | "PARTNER");
                  form.setValue("organizationId", "");
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="COMPANY" id="company" />
                  <Label htmlFor="company">Company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PARTNER" id="partner" />
                  <Label htmlFor="partner">Partner</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Organization Dropdown */}
            {organizationType === "PARTNER" && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={partnersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a partner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {organizationType === "COMPANY" && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        value={company?.nameEn || ""}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Name *</FormLabel>
                    <FormControl>
                      <Input placeholder={nameEnPlaceholder} {...field} />
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
                      <Input placeholder={nameArPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Type - only show if not hidden */}
            {!hideContactType && (
              <FormField
                control={form.control}
                name="contactType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile" {...field} />
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
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="Nationality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
