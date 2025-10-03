"use client";

import { useState, useEffect } from "react";
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useGetFieldsByVenueIdQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useCreateCourtMutation,
  useDeleteFieldMutation,
} from "@/queries/useField";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FieldOwnerResponse,
  CourtResponse,
  UpdateFieldRequest,
} from "@/types/field";
import { ViewFieldDialog } from "@/components/venue-detail/ViewFieldDialog";
import { EditFieldDialog } from "@/components/venue-detail/EditFieldDialog";
import { AddFieldDialog } from "@/components/venue-detail/AddFieldDialog";
import { ViewCourtDialog } from "@/components/venue-detail/ViewCourtDialog";
import { EditCourtDialog } from "@/components/venue-detail/EditCourtDialog";
import { AddCourtDialog } from "@/components/venue-detail/AddCourtDialog";
import { DeleteCourtDialog } from "@/components/venue-detail/DeleteCourtDialog";
import { DeleteFieldDialog } from "@/components/venue-detail/DeleteFieldDialog";

// Days of week mapping for display
const daysOfWeekMap: Record<string, string> = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

// Days of week order for sorting (Monday first, Sunday last)
const daysOfWeekOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

interface FieldsTabProps {
  venueId: number;
}

export function FieldsTab({ venueId }: FieldsTabProps) {
  const {
    data: fieldsData,
    isLoading,
    isError,
    refetch,
  } = useGetFieldsByVenueIdQuery(venueId);
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >(undefined);
  const [isViewFieldDialogOpen, setIsViewFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isCreateFieldDialogOpen, setIsCreateFieldDialogOpen] = useState(false);
  const [isEditCourtDialogOpen, setIsEditCourtDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldOwnerResponse | null>(
    null
  );
  const [viewingField, setViewingField] = useState<FieldOwnerResponse | null>(
    null
  );
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null);
  const [viewingCourt, setViewingCourt] = useState<CourtResponse | null>(null);
  const [deletingCourt, setDeletingCourt] = useState<CourtResponse | null>(
    null
  );
  const [deletingField, setDeletingField] = useState<FieldOwnerResponse | null>(
    null
  );
  const [updatingFieldId, setUpdatingFieldId] = useState<number | null>(null);
  const [updatingCourtId, setUpdatingCourtId] = useState<number | null>(null);
  const [addingCourtField, setAddingCourtField] =
    useState<FieldOwnerResponse | null>(null);
  const [isViewCourtDialogOpen, setIsViewCourtDialogOpen] = useState(false);
  const [isDeleteCourtDialogOpen, setIsDeleteCourtDialogOpen] = useState(false);
  const [isDeleteFieldDialogOpen, setIsDeleteFieldDialogOpen] = useState(false);
  const [isAddCourtDialogOpen, setIsAddCourtDialogOpen] = useState(false);

  const createFieldMutation = useCreateFieldMutation();
  const updateFieldMutation = useUpdateFieldMutation();
  const updateCourtMutation = useUpdateCourtMutation();
  const deleteCourtMutation = useDeleteCourtMutation();
  const createCourtMutation = useCreateCourtMutation();
  const deleteFieldMutation = useDeleteFieldMutation();

  // Effect to reset updatingFieldId when updateFieldMutation completes
  useEffect(() => {
    if (updateFieldMutation.isSuccess || updateFieldMutation.isError) {
      setUpdatingFieldId(null);
    }
  }, [updateFieldMutation.isSuccess, updateFieldMutation.isError]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    // Assuming timeString is in format "HH:mm:ss"
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const handleViewField = (field: FieldOwnerResponse) => {
    setViewingField(field);
    setIsViewFieldDialogOpen(true);
  };

  const handleEditField = (field: FieldOwnerResponse) => {
    setEditingField(field);
    setIsEditFieldDialogOpen(true);
  };

  const handleCreateField = () => {
    setIsCreateFieldDialogOpen(true);
  };

  const handleEditCourt = (court: CourtResponse, field: FieldOwnerResponse) => {
    setEditingCourt(court);
    setEditingField(field);
    setIsEditCourtDialogOpen(true);
  };

  const handleViewCourt = (court: CourtResponse) => {
    setViewingCourt(court);
    setIsViewCourtDialogOpen(true);
  };

  const handleDeleteCourt = (court: CourtResponse) => {
    setDeletingCourt(court);
    setIsDeleteCourtDialogOpen(true);
  };

  const handleDeleteField = (field: FieldOwnerResponse) => {
    setDeletingField(field);
    setIsDeleteFieldDialogOpen(true);
  };

  const handleAddCourt = (field: FieldOwnerResponse) => {
    setAddingCourtField(field);
    setIsAddCourtDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách sân</CardTitle>
              <CardDescription>Đang tải dữ liệu...</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              disabled
            >
              <PencilIcon className="h-4 w-4" />
              Quản lý sân
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !fieldsData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách sân</CardTitle>
              <CardDescription>Có lỗi xảy ra khi tải dữ liệu.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Quản lý sân
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-red-500">
              Có lỗi xảy ra khi tải dữ liệu
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Danh sách cụm sân</CardTitle>
            <CardDescription>
              Quản lý các cụm sân và sân của địa điểm
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleCreateField}
          >
            <PlusIcon className="h-4 w-4" />
            Thêm cụm sân
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fieldsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">Chưa có sân nào</p>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCreateField}
            >
              <PlusIcon className="h-4 w-4" />
              Thêm sân đầu tiên
            </Button>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-lg overflow-hidden shadow-sm"
            value={openAccordionItem}
            onValueChange={setOpenAccordionItem}
          >
            {fieldsData.map((field) => (
              <AccordionItem
                key={field.id}
                value={`field-${field.id}`}
                className="border-b-0 last:border-b-0"
              >
                <AccordionTrigger className="flex items-center justify-between w-full py-4 hover:no-underline bg-white hover:bg-gray-50 px-6">
                  <div className="w-full flex items-center gap-4 justify-between mr-8">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-800">
                        {field.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {field.courts.length} sân
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Field Status Switch */}
                      <Switch
                        checked={field.status === "ENABLE"}
                        onCheckedChange={(checked) => {
                          // Update field status
                          const newStatus = checked ? "ENABLE" : "UNABLE";
                          setUpdatingFieldId(field.id);
                          updateFieldMutation.mutate({
                            fieldId: field.id,
                            body: {
                              name: field.name,
                              monthLimit: field.monthLimit,
                              defaultOpenTime:
                                field.openingHours[0]?.openTime || "00:00:00",
                              defaultCloseTime:
                                field.openingHours[0]?.closeTime || "23:59:59",
                              status: newStatus,
                              openingHours: field.openingHours,
                            },
                          });
                        }}
                        disabled={updateFieldMutation.isPending}
                      />
                      {updateFieldMutation.isPending &&
                        updatingFieldId === field.id && (
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCourt(field);
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
                          handleViewField(field);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditField(field);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-gray-300 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(field);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 px-6">
                    <div className="col-span-full space-y-2">
                      {field.courts.map((court) => (
                        <div
                          key={court.id}
                          className="w-full border rounded-lg p-4 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-medium text-gray-800">
                            {court.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={court.status === "ENABLE"}
                              onCheckedChange={(checked) => {
                                // Update court status
                                // setUpdatingCourtId(court.id);
                                console.log("🚀 ~ court.id:", court.id);

                                const newStatus = checked ? "ENABLE" : "UNABLE";
                                updateCourtMutation.mutate({
                                  courtId: court.id,
                                  body: {
                                    name: court.name,
                                    defaultPrice: court.defaultPrice,
                                    status: newStatus,
                                    dailyPricing: court.dailyPricing,
                                  },
                                });
                              }}
                              // disabled={
                              //   updateCourtMutation.isPending &&
                              //   updatingCourtId === court.id
                              // }
                            />
                            {/* {updateCourtMutation.isPending &&
                              updatingCourtId === court.id && (
                                <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                              )} */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCourt(court);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCourt(court, field);
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
                                handleDeleteCourt(court);
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      {/* View Field Details Dialog */}
      {viewingField && (
        <ViewFieldDialog
          field={viewingField}
          open={isViewFieldDialogOpen}
          onOpenChange={setIsViewFieldDialogOpen}
          onSuccess={refetch}
        />
      )}

      {/* Edit Field Dialog */}
      {editingField && (
        <EditFieldDialog
          field={editingField}
          open={isEditFieldDialogOpen}
          onOpenChange={(open) => {
            setIsEditFieldDialogOpen(open);
            if (!open) {
              setEditingField(null);
            }
          }}
          onSuccess={() => {
            refetch();
            setEditingField(null);
          }}
        />
      )}

      {/* Create Field Dialog */}
      <AddFieldDialog
        venueId={venueId}
        open={isCreateFieldDialogOpen}
        onOpenChange={setIsCreateFieldDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Edit Court Dialog */}
      {editingCourt && (
        <EditCourtDialog
          open={isEditCourtDialogOpen}
          // onOpenChange={setIsEditCourtDialogOpen}
          onOpenChange={(open) => {
            setIsEditCourtDialogOpen(open);
            if (!open) {
              setEditingCourt(null);
            }
          }}
          editingCourt={editingCourt}
          fieldsData={editingField}
          updateCourtMutation={updateCourtMutation}
          refetch={refetch}
        />
      )}

      {/* Add Court Dialog */}
      {addingCourtField && (
        <AddCourtDialog
          open={isAddCourtDialogOpen}
          onOpenChange={setIsAddCourtDialogOpen}
          addingCourtField={addingCourtField}
          createCourtMutation={createCourtMutation}
          refetch={refetch}
        />
      )}

      {/* View Court Dialog */}
      {viewingCourt && (
        <ViewCourtDialog
          court={viewingCourt}
          open={isViewCourtDialogOpen}
          onOpenChange={(open) => {
            setIsViewCourtDialogOpen(open);
            if (!open) {
              setViewingCourt(null);
            }
          }}
        />
      )}

      {/* Delete Court Confirmation Dialog */}
      {deletingCourt && (
        <DeleteCourtDialog
          open={isDeleteCourtDialogOpen}
          onOpenChange={setIsDeleteCourtDialogOpen}
          deletingCourt={deletingCourt}
          deleteCourtMutation={deleteCourtMutation}
          refetch={refetch}
        />
      )}

      {/* Delete Field Confirmation Dialog */}
      {deletingField && (
        <DeleteFieldDialog
          open={isDeleteFieldDialogOpen}
          onOpenChange={setIsDeleteFieldDialogOpen}
          deletingField={deletingField}
          deleteFieldMutation={deleteFieldMutation}
          refetch={refetch}
        />
      )}
    </Card>
  );
}
