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

