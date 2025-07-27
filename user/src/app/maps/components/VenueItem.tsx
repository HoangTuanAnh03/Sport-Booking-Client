import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeVenueSearchedFromLocalStorage } from "@/lib/utils";

export default function VenueItem({
  venue,
  type = "default",
}: {
  venue: CoordinateVenue;
  type?: string;
}) {
  const router = useRouter();
  const handleVenueClick = () => {
    router.push(`/maps?id=${venue.id}`);
  };

  const handleClearClick = () => {
    removeVenueSearchedFromLocalStorage(venue.id);
  };

  return (
    <div
      key={venue.id}
      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer select-none"
      onClick={() => handleVenueClick()}
    >
      <div className="h-12 w-12 relative rounded-md overflow-hidden flex items-center justify-center">
        {type === "default" ? (
          <Image
            src={`/marker/marker_${venue.type}.png`}
            alt={venue.name}
            fill
            className="object-cover pointer-events-none"
          />
        ) : (
          <Clock size={40} className="text-gray-400 " />
        )}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <div className="font-medium">{venue.name}</div>
          <div className="text-sm text-gray-500">{venue.address}</div>
        </div>
        {/* {type !== "default" && (
          <Button
            variant={"ghost"}
            onClick={(e) => {
              e.stopPropagation();
              handleClearClick();
            }}
          >
            <X size={20} />
          </Button>
        )} */}
      </div>
    </div>
  );
}
