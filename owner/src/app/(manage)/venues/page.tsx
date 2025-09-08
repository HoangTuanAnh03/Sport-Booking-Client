"use client";

import { useGetMyVenuesQuery } from "@/queries/useVenue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function VenuesPage() {
  const { data: venues, isLoading, error } = useGetMyVenuesQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Không thể tải danh sách địa điểm
          </h2>
          <p className="text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BuildingIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Quản lý địa điểm</h1>
          <p className="text-muted-foreground">
            Danh sách các địa điểm thể thao của bạn
          </p>
        </div>
      </div>

      {venues && venues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Link key={venue.id} href={`/venues/${venue.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    {venue.name}
                  </CardTitle>
                  <CardDescription>
                    Nhấp để xem chi tiết địa điểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      ID: {venue.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              Chưa có địa điểm nào được tạo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
