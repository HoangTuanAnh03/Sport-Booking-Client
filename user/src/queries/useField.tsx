import { useQuery } from "@tanstack/react-query";
import fieldApiRequest from "@/apiRequests/field";

export const useGetFieldByVenueId = (id: number) => {
  return useQuery({
    queryKey: ["getFieldByVenueId", id],
    queryFn: () => fieldApiRequest.sGetFieldByVenueId(id),
    staleTime: 10 * 1000,
  });
};

export const useGetCourtSlotsByFieldId = (id: string, date?: string) => {
  return useQuery({
    queryKey: ["getCourtSlotsByFieldId", id, date],
    queryFn: () => fieldApiRequest.sGetCourtSlotsByFieldId(id, date),
    staleTime: 10 * 1000,
  });
};
