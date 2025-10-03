"use client";

import { useState } from "react";
import { BuildingIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InlineEditVenueForm } from "@/components/InlineEditVenueForm";
import { VenueDetail } from "@/types/venue";

interface GeneralTabProps {
  venue: VenueDetail;
  onVenueUpdated: () => void;
}

export function GeneralTab({ venue, onVenueUpdated }: GeneralTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Tổng quan địa điểm
              </CardTitle>
              <CardDescription>
                Quản lý toàn bộ thông tin và dịch vụ của địa điểm
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {venue.categories.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Danh mục dịch vụ
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {venue.categories.reduce(
                  (total, cat) => total + cat.numberOfServices,
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Tổng dịch vụ</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {venue.images.length}
              </div>
              <div className="text-sm text-muted-foreground">Hình ảnh</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-muted-foreground">Sân thể thao</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic and Payment Information - Now using inline editing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5" />
              Thông tin địa điểm
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </Button>
            )}
          </div>
          <CardDescription>
            Chỉnh sửa thông tin cơ bản và thanh toán của địa điểm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InlineEditVenueForm
            venue={venue}
            onVenueUpdated={onVenueUpdated}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </CardContent>
      </Card>
    </div>
  );
}
