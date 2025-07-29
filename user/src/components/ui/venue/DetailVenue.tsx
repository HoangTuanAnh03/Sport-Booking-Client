import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { useGetVenueDetail } from "@/queries/useVenue";
import { InfoDetailVenue } from "@/components/ui/venue/detail/Info";
import { ReviewVenue } from "@/components/ui/venue/detail/Review";
import FieldModal from "@/components/FieldModal";
import { Field } from "@/types/field";
import { useGetFieldByVenueId } from "@/queries/useField";
import { cn, getAccessTokenFormLocalStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import StarRatings from "react-star-ratings";

import { ImageVenue } from "@/components/ui/venue/detail/Image";

export const DetailVenue = () => {
  const [detailVenue, setDetailVenue] = useState<VenueDetail>();
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  const { data } = useGetVenueDetail(venueIdSelected ?? 0);
  const { data: fields } = useGetFieldByVenueId(venueIdSelected ?? 0);
  const accessToken = getAccessTokenFormLocalStorage();
  const router = useRouter();

  useEffect(() => {
    if (data?.payload.data) {
      setDetailVenue(data?.payload.data);
    }
  }, [data]);

  // Tạo URL chia sẻ cho sân được chọn
  const getShareableLink = () => {
    if (!detailVenue) return "";

    // Lấy URL cơ sở của trang hiện tại
    const baseUrl = window.location.origin;
    return `${baseUrl}/maps?id=${detailVenue.id}`;
  };

  // Hàm chia sẻ link
  const shareField = () => {
    const link = getShareableLink();
    if (navigator.share) {
      navigator
        .share({
          title: detailVenue?.name,
          text: `Xem thông tin về ${detailVenue?.name}`,
          url: link,
        })
        .catch((err) => {
          console.error("Lỗi khi chia sẻ:", err);
        });
    } else {
      // Fallback nếu Web Share API không được hỗ trợ
      navigator.clipboard.writeText(link).then(() => {
        alert("Đã sao chép liên kết vào clipboard!");
      });
    }
  };

  const showField = () => {
    if (!detailVenue) return "";
    if (fields?.payload.data) {
      setFieldData(fields?.payload.data.data);
      setIsFieldModalOpen(true);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-t from-black/20 to-transparent">
          <Image
            loader={() => detailVenue?.images.thumbnail || "/placeholder.png"}
            src={detailVenue?.images.thumbnail || "/placeholder.png"}
            alt={detailVenue?.name ?? "Venue Image"}
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute -bottom-[68px] left-4">
          <div className="h-28 w-28 rounded-full border-4 border-white bg-white overflow-hidden">
            <Image
              loader={() => detailVenue?.images.avatar || "/default_avatar.png"}
              src={detailVenue?.images.avatar || "/default_avatar.png"}
              alt={detailVenue?.name ?? "Venue Image"}
              width={112}
              height={112}
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-6 w-full justify-between items-center p-4 pl-36">
        <div className="   ">
          <h1 className="text-xl font-bold text-gray-700">
            {detailVenue?.name}
          </h1>
          <div className="flex items-center mt-1">
            {detailVenue?.rating != 0 && (
              <p className="text-sm text-yellow-300 mr-2">
                {detailVenue?.rating}
              </p>
            )}
            <StarRatings
              rating={detailVenue?.rating || 0}
              starRatedColor="yellow"
              name="rating"
              starDimension="16px"
              starSpacing="2px"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={shareField} className="bg-white">
            Chia sẻ
          </Button> */}

          <Button
            className={`${
              detailVenue?.status !== "ENABLE"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            onClick={() => {
              if (accessToken) {
                showField();
              } else {
                router.push("/login");
              }
            }}
            disabled={detailVenue?.status !== "ENABLE"}
          >
            Đặt lịch
          </Button>
        </div>
      </div>
      <FieldModal
        data={fieldData}
        isOpen={isFieldModalOpen}
        setIsOpen={setIsFieldModalOpen}
      />
      {/* Tabs */}
      <div className="mt-4 px-4 flex-1 overflow-auto">
        <Tabs defaultValue="info" className="flex flex-col">
          <div className="sticky top-0 z-10 bg-white">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="services">Dịch vụ</TabsTrigger>
              <TabsTrigger value="photos">Hình ảnh</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="space-y-4">
            <InfoDetailVenue venue={data?.payload.data} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewVenue />
          </TabsContent>

          <TabsContent value="services">
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có thông tin dịch vụ.</p>
            </div>
          </TabsContent>

          <TabsContent value="photos">
            <ImageVenue />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
