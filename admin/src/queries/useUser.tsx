import userApiRequest from "@/apiRequests/users";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAllUserQuery = (
  params?: {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    sortDir?: string;
    sortBy?: string;
  }
) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApiRequest.sGetListUser(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useGetByIdQuery = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["userById", id],
    queryFn: () => userApiRequest.sGetById(id),
    staleTime: 10 * 1000,
    enabled,
  });
};

export const useUpRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApiRequest.sUpRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApiRequest.sDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

