import {useMutation, useQuery} from "@tanstack/react-query";
import courtApiRequest from "@/apiRequests/court";
import {BookingRequest} from "@/types/court";

export const useGetCourtTimeByFieldId = (id: string, date: string) => {
    return useQuery({
        queryKey: ["getCourtTimeByFieldId", id, date],
        queryFn: () => courtApiRequest.sGetCourtTimeByFieldId(id, date),
        staleTime: 10 * 1000,
    })
}

export const useCreateBooking = (bookingRequest: BookingRequest) => {
    return useQuery({
        queryKey: ["createBooking", bookingRequest],
        queryFn: () => courtApiRequest.sCreateBooking(bookingRequest),
        staleTime: 10 * 1000,
    })
}

export const useCreateBookingMutation = () => {
    return useMutation({
        mutationFn: courtApiRequest.sCreateBooking,
    });
};

export const useConfirmBooking = () => {
    return useMutation({
        mutationFn: courtApiRequest.sConfirmBooking,
    })
}