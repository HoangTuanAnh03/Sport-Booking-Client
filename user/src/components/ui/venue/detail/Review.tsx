import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useGetReview } from "@/queries/useReview";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { cn } from "@/lib/utils";
import { Review } from "@/types/review";
import Image from "next/image";

export const ReviewVenue = () => {
  const [review, setReview] = useState<Review[]>();
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);
  const { data, isLoading } = useGetReview(venueIdSelected ?? "", 1, 4);

  useEffect(() => {
    if (data?.payload.data) {
      setReview(data?.payload.data.data ?? []);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center my-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-row ml-6">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px] mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (review?.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <div className="py-2 max-h-[400px] overflow-y-auto">
      {review?.map((item, index) => (
        <div key={item.review_id}>
          <div className="flex items-center justify-start my-3">
            <Image
              src={"/default_avatar.png"}
              alt="Avatar"
              width={40}
              height={40}
              className="h-14 w-14 rounded-full"
            />
            <div className="flex-row ml-6">
              <div className="flex items-center">
                <p className="">{item.user.name}</p>
                <div className="flex items-center ml-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4 mr-0.5",
                        i < Math.floor(item.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <p className="text-sm text-gray-500">{item.comment}</p>
                {/* <p className="text-sm text-gray-500 ml-2">
                  {new Date(item.created_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p> */}
              </div>
            </div>
          </div>
          {index < review.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
