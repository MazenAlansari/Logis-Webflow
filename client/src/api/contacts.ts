import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import type { PartnerDTO } from "./partners";
import type { CompanyDTO } from "./company";

// Contact DTO type matching API response
export type ContactDTO = {
  id: string;
  organizationId: string;
  userId: string | null;
  nameEn: string;
  nameAr: string;
  contactType:
    | "DRIVER"
    | "STAFF"
    | "MANAGER"
    | "CUSTOMER_SERVICE"
    | "SALES"
    | "ACCOUNTANT"
    | "OTHER";
  mobile: string | null;
  email: string | null;
  nationality: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  organization?: PartnerDTO | CompanyDTO; // Included when fetched with organization
};

export type CreateContactRequest = {
  organizationId: string;
  userId?: string;
  nameEn: string;
  nameAr: string;
  contactType:
    | "DRIVER"
    | "STAFF"
    | "MANAGER"
    | "CUSTOMER_SERVICE"
    | "SALES"
    | "ACCOUNTANT"
    | "OTHER";
  mobile?: string;
  email?: string;
  nationality?: string;
  notes?: string;
};

export type UpdateContactRequest = {
  organizationId?: string;
  userId?: string | null;
  nameEn?: string;
  nameAr?: string;
  contactType?:
    | "DRIVER"
    | "STAFF"
    | "MANAGER"
    | "CUSTOMER_SERVICE"
    | "SALES"
    | "ACCOUNTANT"
    | "OTHER";
  mobile?: string;
  email?: string;
  nationality?: string;
  notes?: string;
};

/**
 * Pagination response type
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Pagination params
 */
export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  organizationType?: "COMPANY" | "PARTNER";
  contactType?: string;
  search?: string;
};

/**
 * Fetch contacts with pagination
 */
export async function fetchContactsPaginated(
  params: PaginationParams
): Promise<PaginatedResponse<ContactDTO>> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.sortBy) {
    queryParams.set("sortBy", params.sortBy);
  }
  if (params.sortOrder) {
    queryParams.set("sortOrder", params.sortOrder);
  }
  if (params.organizationType) {
    queryParams.set("organizationType", params.organizationType);
  }
  if (params.contactType) {
    queryParams.set("contactType", params.contactType);
  }
  if (params.search) {
    queryParams.set("search", params.search);
  }
  const res = await apiRequest(
    "GET",
    `${api.admin.contacts.listPaginated.path}?${queryParams.toString()}`
  );
  return res.json();
}

/**
 * Get contact by ID
 */
export async function fetchContact(id: string): Promise<ContactDTO> {
  const res = await apiRequest(
    "GET",
    api.admin.contacts.get.path.replace(":id", id)
  );
  return res.json();
}

/**
 * Create a new contact
 */
export async function createContact(
  data: CreateContactRequest
): Promise<ContactDTO> {
  const res = await apiRequest("POST", api.admin.contacts.create.path, data);
  return res.json();
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string,
  data: UpdateContactRequest
): Promise<ContactDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.contacts.update.path.replace(":id", contactId),
    data
  );
  return res.json();
}

/**
 * Activate a contact
 */
export async function activateContact(contactId: string): Promise<ContactDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.contacts.activate.path.replace(":id", contactId)
  );
  return res.json();
}

/**
 * Deactivate a contact (soft delete)
 */
export async function deactivateContact(
  contactId: string
): Promise<ContactDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.contacts.deactivate.path.replace(":id", contactId)
  );
  return res.json();
}

/**
 * Fetch all partners (for dropdown)
 */
export async function fetchPartners(): Promise<PartnerDTO[]> {
  const res = await apiRequest("GET", "/api/admin/organizations/partners");
  return res.json();
}

/**
 * Fetch company (for auto-selection)
 */
export async function fetchCompany(): Promise<CompanyDTO> {
  const res = await apiRequest("GET", "/api/admin/organizations/company");
  return res.json();
}
