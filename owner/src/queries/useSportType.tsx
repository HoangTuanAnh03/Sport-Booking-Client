import sportTypeApiRequest from "@/apiRequests/sport-type";
import { useQuery } from "@tanstack/react-query";
import { SportTypeResponse } from "@/types/sport-type";

export const useGetAllSportTypesQuery = () => {
  return useQuery({
    queryKey: ["sport-types"],
    queryFn: async () => {
      try {
        const response = await sportTypeApiRequest.sGetAllSportTypes();
        console.log("Sport types API response:", response);

        // Check if response is successful and has data
        if (response.status === 200) {
          return response.payload?.content;
        }

        // Handle case where response is successful but data is null/undefined
        if (response.status === 200) {
          console.warn("Sport types API returned success but no data");
          return [];
        }

        // Handle error cases
        throw new Error(`API Error: ${response.status}`);
      } catch (error) {
        console.error("Error fetching sport types:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useGetSportTypeByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["sport-types", id],
    queryFn: async () => {
      try {
        const response = await sportTypeApiRequest.sGetSportTypeById(id);
        console.log("Sport type by ID API response:", response);

        // Check if response is successful and has data
        if (response.status === 200 && response.payload?.data) {
          return response.payload.data;
        }

        // Handle case where response is successful but data is null/undefined
        if (response.status === 200) {
          console.warn("Sport type by ID API returned success but no data");
          return null;
        }

        // Handle error cases
        throw new Error(`API Error: ${response.status}`);
      } catch (error) {
        console.error(`Error fetching sport type with ID ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id,
  });
};
