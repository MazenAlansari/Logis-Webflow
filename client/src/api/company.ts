import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";

// Company DTO type matching API response
export type CompanyDTO = {
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

export type CreateCompanyRequest = {
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

export type UpdateCompanyRequest = {
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
 * Fetch company info
 */
export async function fetchCompany(): Promise<CompanyDTO> {
  const res = await apiRequest("GET", api.admin.company.get.path);
  return res.json();
}

/**
 * Create company (only if it doesn't exist)
 */
export async function createCompany(
  data: CreateCompanyRequest
): Promise<CompanyDTO> {
  const res = await apiRequest("POST", api.admin.company.create.path, data);
  return res.json();
}

/**
 * Update company
 */
export async function updateCompany(
  data: UpdateCompanyRequest
): Promise<CompanyDTO> {
  const res = await apiRequest("PATCH", api.admin.company.update.path, data);
  return res.json();
}
