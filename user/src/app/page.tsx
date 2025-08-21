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
import { useEffect, useState } from "react";
import { Field } from "@/types/field";
import { useVenues } from "@/queries/useVenue";
import { useRouter } from "next/navigation";
import { useSaveUserLocation } from "@/hooks/use-location";

export default function Home() {
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [venueIdSelected, setVenueIdSelected] = useState<number>(0);

  const { data: fields } = useGetFieldByVenueId(venueIdSelected ?? "");
  const { data: venues, isLoading } = useVenues();
  const accessToken = getAccessTokenFormLocalStorage();
  const router = useRouter();
  useSaveUserLocation();

  useEffect(() => {
    if (fields?.payload.data) {
      setFieldData(fields?.payload.data.data);
      setIsFieldModalOpen(true);
    }
  }, [fields]);

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

          {/* <div className="max-w-3xl mx-auto mb-12">
            <SearchBar />
          </div> */}
          <div className="flex justify-center">
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
          </div>

          {/* <div className="mb-12"><FieldTypeFilter /></div> */}
        </section>

        <section className="py-4">
          {/* <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Bản đồ nổi bật</h2>
            <Link href="/fields" className="text-primary hover:underline">
              Xem tất cả
            </Link>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {isLoading
              ? [...Array(4)].map((_, index) => (
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
              : venues?.payload.data?.map((venue) => (
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
                              src={
                                venue.images?.avatar || "/default_avatar.png"
                              }
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
                            <div className="flex items-center text-muted-foreground text-sm ">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-red-500">
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
                ))}
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
