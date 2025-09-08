"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useGetVenueDetailQuery,
  useUpdateVenueStatusMutation,
  useCreateVenueImagesMutation,
  useDeleteVenueImageMutation,
} from "@/queries/useVenue";
import { Category } from "@/types/venue";
import {
  AppWindowIcon,
  CodeIcon,
  ImageIcon,
  ListIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingIcon,
  CreditCardIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  Check,
  X,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineEditVenueForm } from "@/components/InlineEditVenueForm";
import { EditCategoryDialog } from "@/components/EditCategoryDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { EditVenueImagesDialog } from "@/components/EditVenueImagesDialog";
import { Service } from "@/types/venue";
import { Switch } from "@/components/ui/switch";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDeleteServiceMutation } from "@/queries/useService";
import { useDeleteCategoryMutation } from "@/queries/useCategory";
import { useCreateCategoryMutation } from "@/queries/useCategory";

export default function VenueDetailPage() {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"ENABLE" | "UNABLE">(
    "ENABLE"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [addingServiceCategoryId, setAddingServiceCategoryId] = useState<
    number | null
  >(null);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >(undefined);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
    useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingImageType, setEditingImageType] = useState<
    "AVATAR" | "THUMBNAIL" | "DEFAULT" | null
  >(null);
  const [isEditImagesDialogOpen, setIsEditImagesDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false);
  const params = useParams();
  const venueId = parseInt(params.id as string);

  const {
    data: venue,
    isLoading,
    error,
    refetch,
  } = useGetVenueDetailQuery(venueId);
  const updateStatusMutation = useUpdateVenueStatusMutation();
  const deleteServiceMutation = useDeleteServiceMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const deleteVenueImageMutation = useDeleteVenueImageMutation();

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

  const confirmDeleteService = () => {
    if (!serviceToDelete) return;

    deleteServiceMutation.mutate(serviceToDelete.id, {
      onSuccess: () => {
        refetch();
        setIsDeleteConfirmDialogOpen(false);
        setServiceToDelete(null);
      },
    });
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteCategoryMutation.mutate(categoryToDelete.id, {
      onSuccess: () => {
        refetch();
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
      },
    });
  };

  const confirmDeleteImage = () => {
    if (!imageToDelete) return;

    deleteVenueImageMutation.mutate(imageToDelete.id, {
      onSuccess: () => {
        refetch();
        setIsDeleteImageDialogOpen(false);
        setImageToDelete(null);
      },
    });
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLE":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Hoạt động
          </Badge>
        );
      case "UNABLE":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Tạm dừng
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Đang chờ
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Bị từ chối
          </Badge>
        );
      case "LOCK":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Bị khóa
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Chưa thanh toán
          </Badge>
        );
      case "DELETED":
        return (
          <Badge variant="destructive" className="bg-gray-100 text-gray-800">
            Đã xóa
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getImagesByType = (type: "DEFAULT" | "THUMBNAIL" | "AVATAR") => {
    return venue.images.filter((img) => img.type === type);
  };

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
        <div className="flex items-center gap-2 mr-4">
          <span className="text-md">
            {/* {isVenueActive ? "Hoạt động" : "Tạm dừng"} */}
            Trạng thái
          </span>
          <Switch
            checked={isVenueActive}
            onCheckedChange={handleStatusChange}
            disabled={updateStatusMutation.isPending}
            className="h-6 w-11"
          />
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
                    <div className="text-sm text-muted-foreground">
                      Tổng dịch vụ
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {venue.images.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Hình ảnh
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-muted-foreground">
                      Sân thể thao
                    </div>
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
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
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
                  onVenueUpdated={refetch}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-2">
            <div className="flex ">
              <Button
                variant="outline"
                className="flex items-center gap-2  w-full"
                onClick={() => setIsAddCategoryDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>
            <Accordion
              type="single"
              collapsible
              className="w-full border rounded-lg overflow-hidden shadow-sm"
              value={openAccordionItem}
              onValueChange={setOpenAccordionItem}
            >
              {venue.categories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={`category-${category.id}`}
                  className="border-b-0 last:border-b-0"
                >
                  <AccordionTrigger className="flex items-center justify-between w-full py-4 hover:no-underline bg-white hover:bg-gray-50 px-6">
                    <div className="w-full flex items-center gap-4 justify-between mr-8">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {category.numberOfServices} dịch vụ
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {openAccordionItem === `category-${category.id}` && (
                          <Button
                            size="sm"
                            variant="default"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingServiceCategoryId(category.id);
                              setIsAddServiceDialogOpen(true);
                            }}
                          >
                            <PlusIcon className="h-4 w-4" />
                            Thêm dịch vụ
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category);
                            setIsEditCategoryDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                          Chỉnh sửa danh mục
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 bg-white hover:bg-red-50 border-gray-300 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToDelete({
                              id: category.id,
                              name: category.name,
                            });
                            setIsDeleteCategoryDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Xóa danh mục
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-6">
                      {category.services.map((service) => (
                        <div
                          key={service.id}
                          className="border rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-800">
                              {service.name}
                            </h4>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Create a new service object with categoryId from the parent category
                                  const serviceWithCategoryId = {
                                    ...service,
                                    categoryId: category.id,
                                  };
                                  setEditingService(serviceWithCategoryId);
                                  setIsEditServiceDialogOpen(true);
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setServiceToDelete({
                                    id: service.id,
                                    name: service.name,
                                  });
                                  setIsDeleteConfirmDialogOpen(true);
                                }}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                              <div className="flex justify-end">
                                {service.isAvailable ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Có sẵn
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Hết hàng
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Đơn vị: {service.units}
                            </span>
                            <span className="font-semibold text-blue-600">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <div className="space-y-6">
            {/* Avatar and Thumbnail Images - Side by Side Layout */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hình ảnh chính</CardTitle>
                </div>
                <CardDescription>
                  Ảnh đại diện và thumbnail được hiển thị trong kết quả tìm kiếm
                  và bản đồ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Avatar Image */}
                  {getImagesByType("AVATAR").length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h3 className="font-medium">Ảnh đại diện</h3>
                      </div>
                      <div className="relative group">
                        <div className="relative w-48 h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                          {getImagesByType("AVATAR").map((image) => (
                            <img
                              key={image.id}
                              src={image.url}
                              alt="Ảnh đại diện"
                              className="w-full h-full object-cover"
                            />
                          ))}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <PencilIcon
                              className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                              onClick={() => {
                                setEditingImageType("AVATAR");
                                setIsEditImagesDialogOpen(true);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Ảnh được hiển thị trong kết quả tìm kiếm và trang chi
                        tiết
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h3 className="font-medium">Ảnh đại diện</h3>
                      </div>
                      <div
                        className="flex flex-col items-center justify-center w-48 h-48 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setEditingImageType("AVATAR");
                          setIsEditImagesDialogOpen(true);
                        }}
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                          Nhấn để tải lên ảnh đại diện
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Ảnh được hiển thị trong kết quả tìm kiếm và trang chi
                        tiết
                      </p>
                    </div>
                  )}

                  {/* Thumbnail Image */}
                  {getImagesByType("THUMBNAIL").length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h3 className="font-medium">Ảnh thumbnail</h3>
                      </div>
                      <div className="relative group">
                        <div className="relative w-64 h-40 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                          {getImagesByType("THUMBNAIL").map((image) => (
                            <img
                              key={image.id}
                              src={image.url}
                              alt="Ảnh thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ))}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <PencilIcon
                              className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                              onClick={() => {
                                setEditingImageType("THUMBNAIL");
                                setIsEditImagesDialogOpen(true);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Ảnh được hiển thị trên bản đồ và danh sách thu gọn
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h3 className="font-medium">Ảnh thumbnail</h3>
                      </div>
                      <div
                        className="flex flex-col items-center justify-center w-64 h-40 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                        onClick={() => {
                          setEditingImageType("THUMBNAIL");
                          setIsEditImagesDialogOpen(true);
                        }}
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                          Nhấn để tải lên ảnh thumbnail
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Ảnh được hiển thị trên bản đồ và danh sách thu gọn
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Default Images - Grid Layout with Add and Delete Only */}
            {getImagesByType("DEFAULT").length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Ảnh mặc định
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setEditingImageType("DEFAULT");
                        setIsEditImagesDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Thêm ảnh
                    </Button>
                  </div>
                  <CardDescription>
                    Bộ sưu tập ảnh hiển thị trong trang chi tiết địa điểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getImagesByType("DEFAULT").map((image) => (
                      <div key={image.id} className="space-y-2 group relative">
                        <div className="rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={image.url}
                            alt="Ảnh mặc định"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageToDelete({
                                  id: image.id,
                                  url: image.url,
                                });
                                setIsDeleteImageDialogOpen(true);
                              }}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Default Images - Empty State */}
            {getImagesByType("DEFAULT").length === 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Ảnh mặc định
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setEditingImageType("DEFAULT");
                        setIsEditImagesDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Thêm ảnh
                    </Button>
                  </div>
                  <CardDescription>
                    Bộ sưu tập ảnh hiển thị trong trang chi tiết địa điểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Chưa có ảnh mặc định</p>
                    <p className="text-sm text-gray-400 text-center max-w-md">
                      Thêm ảnh để hiển thị trong trang chi tiết địa điểm của bạn
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách sân</CardTitle>
                  <CardDescription>
                    Thông tin về các sân sẽ được hiển thị ở đây sau khi API được
                    thêm vào.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    // TODO: Implement edit fields functionality
                    console.log("Edit fields");
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                  Quản lý sân
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Tính năng đang được phát triển
                </p>
              </div>
            </CardContent>
          </Card>
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

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
          onCategoryUpdated={refetch}
        />
      )}

      {/* Edit Service Dialog */}
      {editingService && (
        <EditServiceDialog
          service={editingService}
          open={isEditServiceDialogOpen}
          onOpenChange={setIsEditServiceDialogOpen}
          onServiceUpdated={refetch}
        />
      )}

      {/* Add Service Dialog */}
      {addingServiceCategoryId && (
        <AddServiceDialog
          categoryId={addingServiceCategoryId}
          open={isAddServiceDialogOpen}
          onOpenChange={setIsAddServiceDialogOpen}
          onServiceAdded={refetch}
        />
      )}

      {/* Delete Service Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmDialogOpen}
        onOpenChange={setIsDeleteConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <strong>{serviceToDelete?.name}</strong> không? Thao tác này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog
        open={isDeleteCategoryDialogOpen}
        onOpenChange={setIsDeleteCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <strong>{categoryToDelete?.name}</strong> không? Tất cả dịch vụ
              trong danh mục này cũng sẽ bị xóa. Thao tác này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        venueId={venueId}
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onCategoryAdded={refetch}
      />

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog
        open={isDeleteImageDialogOpen}
        onOpenChange={setIsDeleteImageDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa ảnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ảnh này không? Thao tác này không thể
              hoàn tác.
              {imageToDelete && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={imageToDelete.url}
                    alt="Preview"
                    className="max-h-32 rounded-lg border"
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Images Dialog */}
      {editingImageType && (
        <EditVenueImagesDialog
          open={isEditImagesDialogOpen}
          onOpenChange={setIsEditImagesDialogOpen}
          imageType={editingImageType}
          venueId={venueId}
          onImageUploaded={refetch}
        />
      )}
    </div>
  );
}
