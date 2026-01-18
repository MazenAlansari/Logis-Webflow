import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";

// User DTO type matching API response (password excluded)
export type UserDTO = {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "DRIVER";
  isActive: boolean;
  mustChangePassword: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export type CreateUserRequest = {
  email: string;
  fullName: string;
  role?: "ADMIN" | "DRIVER";
  isActive?: boolean;
};

export type CreateUserResponse = UserDTO & {
  tempPassword: string;
};

export type UpdateUserRequest = {
  fullName?: string;
  role?: "ADMIN" | "DRIVER";
  isActive?: boolean;
  email?: string;
};

export type ResetPasswordResponse = {
  userId: string;
  tempPassword: string;
};

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  const res = await apiRequest("GET", api.admin.users.list.path);
  return res.json();
}

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
 * Fetch users with pagination
 */
export async function fetchUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<UserDTO>> {
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
  const res = await apiRequest("GET", `${api.admin.users.listPaginated.path}?${queryParams.toString()}`);
  return res.json();
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const res = await apiRequest("POST", api.admin.users.create.path, data);
  return res.json();
}

/**
 * Update a user
 */
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<UserDTO> {
  const res = await apiRequest("PATCH", api.admin.users.update.path.replace(":id", userId), data);
  return res.json();
}

/**
 * Reset user password
 */
export async function resetPassword(userId: string): Promise<ResetPasswordResponse> {
  const res = await apiRequest("POST", api.admin.users.resetPassword.path.replace(":id", userId));
  return res.json();
}

export type SendWelcomeEmailRequest = {
  userId: string;
  tempPassword: string;
};

export type SendWelcomeEmailResponse = {
  ok: boolean;
};

/**
 * Send welcome email to a user
 */
export async function sendWelcomeEmail(data: SendWelcomeEmailRequest): Promise<SendWelcomeEmailResponse> {
  const res = await apiRequest("POST", api.admin.notifications.sendWelcome.path, data);
  return res.json();
}

