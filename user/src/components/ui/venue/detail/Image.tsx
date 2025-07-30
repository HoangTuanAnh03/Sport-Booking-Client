import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useGetImageByVenueId } from "@/queries/useImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageType, VenueImage } from "@/types/image";

export const ImageVenue = () => {
  const [images, setImages] = useState<VenueImage[]>();
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);
  const { data, isLoading } = useGetImageByVenueId(venueIdSelected ?? 0);

  useEffect(() => {
    if (data?.payload.data) {
      setImages(data?.payload.data ?? []);
    }
  }, [data]);

  if (images?.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có hình ảnh nào.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, idx) => (
          <Skeleton key={idx} className="h-32 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {images
        ?.find((image) => image.imageType == ImageType.DEFAULT)
        ?.images.map((image) => {
          return (
            <div
              key={image.id}
              className="relative h-32 rounded overflow-hidden"
            >
              <Image
                loader={() => image.url || "/placeholder.png"}
                src={image.url || "/placeholder.png"}
                alt={`Image`}
                fill
                className="object-cover"
              />
            </div>
          );
        })}
    </div>
  );
};
