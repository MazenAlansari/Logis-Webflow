import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";

// Partner DTO type matching API response
export type PartnerDTO = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: "COMPANY" | "PARTNER";
  taxId: string | null;
  registrationNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePartnerRequest = {
  nameEn: string;
  nameAr: string;
  taxId?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type UpdatePartnerRequest = {
  nameEn?: string;
  nameAr?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
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
};

/**
 * Fetch all partners
 */
export async function fetchPartners(): Promise<PartnerDTO[]> {
  const res = await apiRequest("GET", api.admin.partners.list.path);
  return res.json();
}

/**
 * Fetch partners with pagination
 */
export async function fetchPartnersPaginated(
  params: PaginationParams
): Promise<PaginatedResponse<PartnerDTO>> {
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
  const res = await apiRequest(
    "GET",
    `${api.admin.partners.listPaginated.path}?${queryParams.toString()}`
  );
  return res.json();
}

/**
 * Get partner by ID
 */
export async function fetchPartner(id: string): Promise<PartnerDTO> {
  const res = await apiRequest(
    "GET",
    api.admin.partners.get.path.replace(":id", id)
  );
  return res.json();
}

/**
 * Create a new partner
 */
export async function createPartner(
  data: CreatePartnerRequest
): Promise<PartnerDTO> {
  const res = await apiRequest("POST", api.admin.partners.create.path, data);
  return res.json();
}

/**
 * Update a partner
 */
export async function updatePartner(
  partnerId: string,
  data: UpdatePartnerRequest
): Promise<PartnerDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.partners.update.path.replace(":id", partnerId),
    data
  );
  return res.json();
}

/**
 * Activate a partner
 */
export async function activatePartner(partnerId: string): Promise<PartnerDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.partners.activate.path.replace(":id", partnerId)
  );
  return res.json();
}

/**
 * Deactivate a partner (soft delete)
 */
export async function deactivatePartner(partnerId: string): Promise<PartnerDTO> {
  const res = await apiRequest(
    "PATCH",
    api.admin.partners.deactivate.path.replace(":id", partnerId)
  );
  return res.json();
}

/**
 * Delete a partner (hard delete)
 */
export async function deletePartner(partnerId: string): Promise<void> {
  await apiRequest(
    "DELETE",
    api.admin.partners.delete.path.replace(":id", partnerId)
  );
}
