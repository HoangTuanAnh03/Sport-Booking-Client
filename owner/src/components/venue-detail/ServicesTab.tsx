"use client";

import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Category, Service } from "@/types/venue";
import { EditCategoryDialog } from "@/components/EditCategoryDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { useDeleteServiceMutation } from "@/queries/useService";
import { useDeleteCategoryMutation } from "@/queries/useCategory";

interface ServicesTabProps {
  venueId: number;
  categories: Category[];
  onCategoriesUpdated: () => void;
}

export function ServicesTab({
  venueId,
  categories,
  onCategoriesUpdated,
}: ServicesTabProps) {
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >(undefined);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [addingServiceCategoryId, setAddingServiceCategoryId] = useState<
    number | null
  >(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] =
    useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const deleteServiceMutation = useDeleteServiceMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete) return;

    deleteServiceMutation.mutate(serviceToDelete.id, {
      onSuccess: () => {
        onCategoriesUpdated();
        setIsDeleteConfirmDialogOpen(false);
        setServiceToDelete(null);
      },
    });
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteCategoryMutation.mutate(categoryToDelete.id, {
      onSuccess: () => {
        onCategoriesUpdated();
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
      },
    });
  };

  return (
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
        {categories.map((category) => (
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddingServiceCategoryId(category.id);
                      setIsAddServiceDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                      setIsEditCategoryDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-gray-300 text-red-600 hover:text-red-700"
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
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 px-6">
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
                            <Badge variant="destructive" className="text-xs">
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

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
          onCategoryUpdated={onCategoriesUpdated}
        />
      )}

      {/* Edit Service Dialog */}
      {editingService && (
        <EditServiceDialog
          service={editingService}
          open={isEditServiceDialogOpen}
          onOpenChange={setIsEditServiceDialogOpen}
          onServiceUpdated={onCategoriesUpdated}
        />
      )}

      {/* Add Service Dialog */}
      {addingServiceCategoryId && (
        <AddServiceDialog
          categoryId={addingServiceCategoryId}
          open={isAddServiceDialogOpen}
          onOpenChange={setIsAddServiceDialogOpen}
          onServiceAdded={onCategoriesUpdated}
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
        onCategoryAdded={onCategoriesUpdated}
      />
    </div>
  );
}
