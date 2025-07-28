import { Clock, MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatTimeToHHMM } from "@/lib/utils";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { Button } from "@/components/ui/button";

interface InfoDetailVenueProps {
  venue: VenueDetail | undefined;
}

export const InfoDetailVenue: React.FC<InfoDetailVenueProps> = ({ venue }) => {
  const setDirectionMode = useSideBarStore((state) => state.setDirectionMode);

  return (
    <>
      <div className="flex items-center px-4 py-2">
        <MapPin className="h-6 w-6 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
        {venue ? (
          <p>{venue?.address}</p>
        ) : (
          <Skeleton className="h-6 w-[250px]" />
        )}
        <Button
          className={"bg-green-500 hover:bg-green-600 ml-auto"}
          onClick={() => {
            setDirectionMode(true);
          }}
        >
          Đường đi
        </Button>
      </div>
      <Separator className="my-2" />
      <div className="flex items-center px-4 py-2">
        <Clock className="h-6 w-6 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
        {venue ? (
          <p>
            Giờ hoạt động: {formatTimeToHHMM(venue?.openTime ?? "00:00:00")} -{" "}
            {formatTimeToHHMM(venue?.closeTime ?? "00:00:00")}
          </p>
        ) : (
          <Skeleton className="h-6 w-[350px]" />
        )}
      </div>
      <Separator className="my-2" />
      <div className="flex items-center px-4 py-2">
        <Phone className="h-6 w-6 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
        {venue ? (
          <p>{venue?.phoneNumber}</p>
        ) : (
          <Skeleton className="h-6 w-[300px]" />
        )}
      </div>
    </>
  );
};
