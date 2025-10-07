import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import slotApiRequest from "@/apiRequests/slot";
import {
  LockCourtSlotRequest,
  MergeCourtSlotRequest,
  UnlockCourtSlotRequest,
} from "@/types/slot";

export const useGetCourtSlotsByFieldIdQuery = (
  fieldId: number,
  date?: string
) => {
  return useQuery({
    queryKey: ["court-slots", "field", fieldId, date],
    queryFn: async () => {
      const response = await slotApiRequest.sGetCourtSlotsByFieldId(
        fieldId,
        date
      );
      return response.payload?.data;
    },
    enabled: !!fieldId,
  });
};

export const useLockCourtSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lockRequest: LockCourtSlotRequest) => {
      return slotApiRequest.sLockCourtSlot(lockRequest);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["court-slots", "field"],
      });
    },
  });
};

export const useUnlockCourtSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unlockRequest: UnlockCourtSlotRequest) => {
      return slotApiRequest.sUnlockCourtSlot(unlockRequest);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["court-slots", "field"],
      });
    },
  });
};

// Add new mutation hook for merging court slots
export const useMergeCourtSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mergeRequest: MergeCourtSlotRequest) => {
      return slotApiRequest.sMergeCourtSlot(mergeRequest);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["court-slots", "field"],
      });
    },
  });
};

// Mutation hook for unmerging court slots
export const useUnmergeCourtSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: number) => {
      return slotApiRequest.sUnmergeCourtSlot(slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["court-slots", "field"],
      });
    },
  });
};
