import { useState } from "react";
import { useQuery, type UseQueryResult, type QueryKey } from "@tanstack/react-query";

export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UsePaginationOptions = {
  defaultPage?: number;
  defaultLimit?: number;
  enabled?: boolean;
};

/**
 * Reusable pagination hook that integrates with TanStack Query
 * @param queryKey - Base query key for TanStack Query
 * @param fetchFn - Function to fetch paginated data
 * @param options - Configuration options
 */
export function usePagination<T>(
  queryKey: QueryKey,
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  options: UsePaginationOptions = {}
) {
  const { defaultPage = 1, defaultLimit = 20, enabled = true } = options;

  const [page, setPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [search, setSearch] = useState("");

  const query: UseQueryResult<PaginatedResponse<T>> = useQuery({
    queryKey: [...queryKey, "paginated", page, limit],
    queryFn: () => fetchFn({ page, limit }),
    enabled,
  });

  // Reset to page 1 when limit changes
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return {
    ...query,
    // Data
    data: query.data?.data || [],
    pagination: query.data?.pagination,
    // State
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,
    search,
    setSearch,
    // Helpers
    hasNextPage: query.data ? query.data.pagination.page < query.data.pagination.totalPages : false,
    hasPreviousPage: query.data ? query.data.pagination.page > 1 : false,
    goToNextPage: () => {
      if (query.data && query.data.pagination.page < query.data.pagination.totalPages) {
        setPage(page + 1);
      }
    },
    goToPreviousPage: () => {
      if (page > 1) {
        setPage(page - 1);
      }
    },
    goToFirstPage: () => setPage(1),
    goToLastPage: () => {
      if (query.data) {
        setPage(query.data.pagination.totalPages);
      }
    },
  };
}

