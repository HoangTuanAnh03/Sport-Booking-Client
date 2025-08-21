import userApiRequest from "@/apiRequests/users";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useGetByIdQuery = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["userById", id],
    queryFn: () => userApiRequest.sGetById(id),
    staleTime: 10 * 1000,
    enabled,
  });
};

export const useGetMyInfoMutation = () => {
  return useMutation({
    mutationFn: userApiRequest.sGetMyInfo,
  });
};
