"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, MapPin, Phone, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/ui/home/search-bar";
import Footer from "@/components/layout/Footer";
import { formatTimeToHHMM, getAccessTokenFormLocalStorage } from "@/lib/utils";
import FieldModal from "@/components/FieldModal";
import { useGetFieldByVenueId } from "@/queries/useField";
import { useEffect, useState, useCallback } from "react";
import { Field } from "@/types/field";
import { useVenues } from "@/queries/useVenue";
import { useRouter } from "next/navigation";
import { useSaveUserLocation, getLocation } from "@/hooks/use-location";
import VenueSearchFilter, {
  VenueSearchFilters,
} from "@/components/VenueSearchFilter";

export default function Home() {
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [venueIdSelected, setVenueIdSelected] = useState<number>(0);
  const [searchFilters, setSearchFilters] = useState<VenueSearchFilters>({
    name: "",
    sportTypes: [],
    maxDistance: undefined,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { data: fields } = useGetFieldByVenueId(venueIdSelected ?? "");

  // Check if any filters are active
  const hasActiveFilters =
    searchFilters.name ||
    searchFilters.sportTypes.length > 0 ||
    searchFilters.maxDistance;

  // Build query parameters for useVenues API based on search filters
  const venueQueryParams = {
    pageNo: 0,
    pageSize: 20,
    ...(searchFilters.name && { name: searchFilters.name }),
    ...(searchFilters.sportTypes.length > 0 && {
      types: searchFilters.sportTypes,
    }),
    ...(searchFilters.maxDistance && {
      maxDistance: searchFilters.maxDistance,
    }),
    ...(userLocation?.lng && { lng: userLocation.lng }),
    ...(userLocation?.lat && { lat: userLocation.lat }),
  };

  // Always call useVenues to get data (either filtered or all venues)
  const { data: venues, isLoading } = useVenues(venueQueryParams);
  const accessToken = getAccessTokenFormLocalStorage();
  const router = useRouter();
  useSaveUserLocation();

  useEffect(() => {
    if (fields?.payload.data) {
      setFieldData(fields?.payload.data.data);
      setIsFieldModalOpen(true);
    }
  }, [fields]);

  // Get user location on component mount
  useEffect(() => {
    const location = getLocation();
    if (location.lat && location.lng) {
      setUserLocation({ lat: location.lat, lng: location.lng });
    }
  }, []);

  const handleFiltersChange = useCallback((newFilters: VenueSearchFilters) => {
    setSearchFilters(newFilters);
  }, []);

  return (
    <>
      <main className="container mx-auto px-4 py-4">
        <section className="py-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Đặt sân thể thao dễ dàng
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tìm và đặt sân thể thao gần bạn chỉ với vài bước đơn giản
            </p>
          </div>

          {/* Venue Search Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <VenueSearchFilter
              onFiltersChange={handleFiltersChange}
              placeholder="Tìm kiếm sân thể thao theo tên..."
              debounceDelay={500}
              className="w-full"
            />
          </div>

          {/* <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className=" bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Link href="/maps" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Khám phá nhiều địa điểm hơn
              </Link>
            </Button>
          </div> */}

          {/* <div className="mb-12"><FieldTypeFilter /></div> */}
        </section>

        <section className="py-4">
          {hasActiveFilters && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Kết quả tìm kiếm</h2>
              {venues?.payload?.data &&
                venues.payload.data.length > 0 &&
                hasActiveFilters && (
                  <span className="text-muted-foreground">
                    {"Tìm thấy "} {venues.payload.data.length} sân
                  </span>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden h-full animate-pulse"
                >
                  <div className="relative h-48 bg-gray-200" />
                  <CardContent className="flex flex-row justify-between p-4">
                    <div className="flex flex-row gap-4 items-center">
                      <div className="h-20 w-20 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-200 rounded" />
                        <div className="h-3 w-72 bg-gray-200 rounded" />
                        <div className="h-3 w-60 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-8 w-24 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : venues?.payload?.data && venues.payload.data.length > 0 ? (
              venues.payload.data.map((venue) => (
                <Link href={`/maps?id=${venue.id}`} key={venue.id}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        loader={() =>
                          venue.images.thumbnail || "/placeholder.png"
                        }
                        src={venue.images.thumbnail || "/placeholder.png"}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="flex flex-row justify-between p-4">
                      <div className="flex flex-row gap-4 items-center">
                        <div className="h-20 flex-none w-20 rounded-full border-4 border-white bg-white overflow-hidden">
                          <Image
                            loader={() =>
                              venue.images?.avatar || "/default_avatar.png"
                            }
                            src={venue.images?.avatar || "/default_avatar.png"}
                            alt={venue.name ?? "Venue Image"}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">
                              {venue.name}
                            </h3>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm mr-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-red-500 min-w-12 flex-shrink-0">
                              {venue.distance.toFixed(2)} km
                            </span>
                            <span className="mx-2">•</span>
                            <span>{venue.address}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm ">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {venue.openTime
                                ? formatTimeToHHMM(venue.openTime)
                                : ""}{" "}
                              -{" "}
                              {venue.closeTime
                                ? formatTimeToHHMM(venue.closeTime)
                                : ""}
                            </span>
                            <span className="mx-2">•</span>
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="text-green-500">
                              {venue.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            if (accessToken) {
                              setVenueIdSelected(venue.id);
                            } else {
                              router.push("/login");
                            }
                          }}
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" /> Đặt ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Empty state when no venues found
              <div className="col-span-full">
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🏟️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Không tìm thấy sân thể thao
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {hasActiveFilters
                        ? "Không có sân nào phù hợp với tiêu chí tìm kiếm của bạn."
                        : "Hiện tại chưa có sân thể thao nào."}
                    </p>
                    <p className="text-sm text-gray-400">
                      {hasActiveFilters
                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                        : "Vui lòng quay lại sau."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <FieldModal
            data={fieldData}
            isOpen={isFieldModalOpen}
            setIsOpen={setIsFieldModalOpen}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
