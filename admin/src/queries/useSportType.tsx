"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import sportTypeApiRequest from "@/apiRequests/sport-type";
import {
  CreateSportTypeBodyType,
  UpdateSportTypeBodyType,
} from "@/schemaValidations/sport-type.schema";
import { toast } from "@/hooks/use-toast";

// Query Keys
const SPORT_TYPE_QUERY_KEYS = {
  all: ["sport-types"] as const,
  lists: () => [...SPORT_TYPE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...SPORT_TYPE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...SPORT_TYPE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SPORT_TYPE_QUERY_KEYS.details(), id] as const,
};

// Get all sport types with query parameters
export const useGetAllSportTypesQuery = (params?: {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  sortDir?: string;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: SPORT_TYPE_QUERY_KEYS.list(params || {}),
    queryFn: () => sportTypeApiRequest.sGetAllSportTypes(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Get sport type by ID
export const useGetSportTypeByIdQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: SPORT_TYPE_QUERY_KEYS.detail(id),
    queryFn: () => sportTypeApiRequest.sGetSportTypeById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Create sport type mutation
export const useCreateSportTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSportTypeBodyType) =>
      sportTypeApiRequest.sCreateSportType(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SPORT_TYPE_QUERY_KEYS.all });
      toast({
        title: "Thành công",
        description: "Tạo môn thể thao mới thành công",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Có lỗi xảy ra khi tạo môn thể thao";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Update sport type mutation
export const useUpdateSportTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateSportTypeBodyType }) =>
      sportTypeApiRequest.sUpdateSportType(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SPORT_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SPORT_TYPE_QUERY_KEYS.detail(variables.id),
      });
      toast({
        title: "Thành công",
        description: "Cập nhật môn thể thao thành công",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Có lỗi xảy ra khi cập nhật môn thể thao";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Delete sport type mutation
export const useDeleteSportTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sportTypeApiRequest.sDeleteSportType(id),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: SPORT_TYPE_QUERY_KEYS.all });
      queryClient.removeQueries({
        queryKey: SPORT_TYPE_QUERY_KEYS.detail(variables),
      });
      toast({
        title: "Thành công",
        description: "Xóa môn thể thao thành công",
      });
    },
  });
};

// Export query keys for external use
export { SPORT_TYPE_QUERY_KEYS };
