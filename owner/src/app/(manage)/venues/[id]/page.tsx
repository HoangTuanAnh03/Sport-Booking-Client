"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetVenueDetailQuery,
  useUpdateVenueStatusMutation,
  useDeleteVenueMutation,
} from "@/queries/useVenue";
import {
  AppWindowIcon,
  ListIcon,
  ImageIcon,
  CodeIcon,
  MapPinIcon,
  BuildingIcon,
  PowerIcon,
  Check,
  X,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { GeneralTab } from "@/components/venue-detail/GeneralTab";
import { ServicesTab } from "@/components/venue-detail/ServicesTab";
import { ImagesTab } from "@/components/venue-detail/ImagesTab";
import { FieldsTab } from "@/components/venue-detail/FieldsTab";
import { Switch } from "@/components/ui/switch";

export default function VenueDetailPage() {
  const router = useRouter();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"ENABLE" | "UNABLE">(
    "ENABLE"
  );
  const [isDeleteVenueDialogOpen, setIsDeleteVenueDialogOpen] = useState(false);
  const params = useParams();
  const venueId = parseInt(params.id as string);

  const {
    data: venue,
    isLoading,
    error,
    refetch,
  } = useGetVenueDetailQuery(venueId);
  const updateStatusMutation = useUpdateVenueStatusMutation();
  const deleteVenueMutation = useDeleteVenueMutation();

  const handleStatusChange = (checked: boolean) => {
    if (!venue) return;

    const newStatus = checked ? "ENABLE" : "UNABLE";
    setPendingStatus(newStatus);
    setIsConfirmDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!venue) return;

    updateStatusMutation.mutate({
      id: venue.id,
      status: pendingStatus,
    });

    setIsConfirmDialogOpen(false);
  };

  const confirmDeleteVenue = () => {
    if (!venue) return;

    deleteVenueMutation.mutate(venueId, {
      onSuccess: () => {
        // Redirect to venues list page after successful deletion
        router.push("/venues");
      },
    });

    setIsDeleteVenueDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Không thể tải thông tin địa điểm
          </h2>
          <p className="text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  const isVenueActive = venue.status === "ENABLE";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BuildingIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{venue.address}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isVenueActive}
              onCheckedChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
              className="h-6"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteVenueDialogOpen(true)}
            disabled={deleteVenueMutation.isPending}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <AppWindowIcon className="h-4 w-4" />
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            Dịch vụ
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Hình ảnh
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <CodeIcon className="h-4 w-4" />
            Sân
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab venue={venue} onVenueUpdated={refetch} />
        </TabsContent>

        <TabsContent value="services">
          <ServicesTab
            venueId={venueId}
            categories={venue.categories}
            onCategoriesUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="images">
          <ImagesTab
            venueId={venueId}
            images={venue.images}
            onImagesUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="fields">
          <FieldsTab venueId={venueId} />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn{" "}
              {pendingStatus === "ENABLE" ? "kích hoạt" : "tạm dừng"} địa điểm
              này không? Thao tác này sẽ ảnh hưởng đến khả năng hiển thị của địa
              điểm đối với khách hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Venue Confirmation Dialog */}
      <AlertDialog
        open={isDeleteVenueDialogOpen}
        onOpenChange={setIsDeleteVenueDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa điểm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa điểm <strong>{venue?.name}</strong>{" "}
              không? Thao tác này không thể hoàn tác và tất cả dữ liệu liên quan
              đến địa điểm này sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVenue}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteVenueMutation.isPending}
            >
              {deleteVenueMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
