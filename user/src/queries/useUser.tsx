import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApiRequest from "@/apiRequests/users";
import { User } from "@/types/user";
import {
  UpdateUserBodyType,
  ChangePasswordBodyType,
} from "@/schemaValidations/user.schema";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  myInfo: () => [...userKeys.all, "my-info"] as const,
};

// Get current user info
export function useMyInfoQuery() {
  return useQuery({
    queryKey: userKeys.myInfo(),
    queryFn: async () => {
      const response = await userApiRequest.sMyInfo();
      return response.payload.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Update user info mutation
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserBodyType) => {
      const response = await userApiRequest.sUpdateUser(userData);
      return response.payload.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user info
      queryClient.invalidateQueries({ queryKey: userKeys.myInfo() });

      // Optionally update the cache directly
      queryClient.setQueryData(
        userKeys.myInfo(),
        (oldData: User | undefined) => {
          if (!oldData) return data;
          return { ...oldData, ...data };
        }
      );
    },
  });
}

// Change password mutation
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (
      passwordData: Pick<ChangePasswordBodyType, "oldPassword" | "newPassword">
    ) => {
      const response = await userApiRequest.sChangePassword(passwordData);
      return response;
    },
  });
}
