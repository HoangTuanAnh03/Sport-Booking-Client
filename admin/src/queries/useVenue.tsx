"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import venueApiRequest from "@/apiRequests/venue";
import {
  CreateVenueBodyType,
  UpdateVenueBodyType,
  UpdateVenueStatusBodyType,
  VenueAdminSearchType,
} from "@/schemaValidations/venue.schema";
import { toast } from "@/hooks/use-toast";

// Query Keys
const VENUE_QUERY_KEYS = {
  all: ["venues"] as const,
  lists: () => [...VENUE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...VENUE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...VENUE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...VENUE_QUERY_KEYS.details(), id] as const,
};

// Search venues for admin with pagination and filters
export const useSearchVenuesForAdminQuery = (params?: VenueAdminSearchType) => {
  return useQuery({
    queryKey: VENUE_QUERY_KEYS.list(params || {}),
    queryFn: () => venueApiRequest.sSearchVenuesForAdmin(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Get venue by ID
export const useGetVenueByIdQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: VENUE_QUERY_KEYS.detail(id),
    queryFn: () => venueApiRequest.sGetVenueById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Create venue mutation
export const useCreateVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVenueBodyType) =>
      venueApiRequest.sCreateVenue(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.all });
      toast({
        title: "Thành công",
        description: "Tạo địa điểm mới thành công",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Có lỗi xảy ra khi tạo địa điểm";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Update venue mutation
export const useUpdateVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateVenueBodyType }) =>
      venueApiRequest.sUpdateVenue(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: VENUE_QUERY_KEYS.detail(variables.id),
      });
      toast({
        title: "Thành công",
        description: "Cập nhật địa điểm thành công",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Có lỗi xảy ra khi cập nhật địa điểm";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Update venue status mutation
export const useUpdateVenueStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateVenueStatusBodyType) =>
      venueApiRequest.sUpdateVenueStatus(body),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: VENUE_QUERY_KEYS.detail(variables.id),
      });
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái địa điểm thành công",
      });
    },
  });
};

// Delete venue mutation
export const useDeleteVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => venueApiRequest.sDeleteVenue(id),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.all });
      queryClient.removeQueries({
        queryKey: VENUE_QUERY_KEYS.detail(variables),
      });
      toast({
        title: "Thành công",
        description: "Xóa địa điểm thành công",
      });
    },
  });
};

// Export query keys for external use
export { VENUE_QUERY_KEYS };
