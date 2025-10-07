import envConfig from "@/config";
import {
  LockCourtSlotRequest,
  MergeCourtSlotRequest,
  UnlockCourtSlotRequest,
} from "@/types/slot";
import http from "@/utils/api";

const slotApiRequest = {
  sGetCourtSlotsByFieldId: (fieldId: number, date?: string) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append("date", date);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/fields/${fieldId}/slots?${queryString}`
      : `/fields/${fieldId}/slots`;

    return http.get<any>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    });
  },
  sLockCourtSlot: (lockRequest: LockCourtSlotRequest) => {
    return http.post<any>("/court-slots/lock", lockRequest, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    });
  },

  sMergeCourtSlot: (mergeRequest: MergeCourtSlotRequest) => {
    return http.post<any>("/court-slots/merge", mergeRequest, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    });
  },

  sUnmergeCourtSlot: (slotId: number) => {
    return http.delete<any>(
      `/court-slots/unmerge/${slotId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    );
  },

  sUnlockCourtSlot: (unlockRequest: UnlockCourtSlotRequest) => {
    return http.post<any>("/court-slots/unlock", unlockRequest, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    });
  },
};

export default slotApiRequest;
