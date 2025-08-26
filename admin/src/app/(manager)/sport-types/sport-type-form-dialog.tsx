"use client";

import React, { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CreateSportTypeBody,
  UpdateSportTypeBody,
  CreateSportTypeBodyType,
  UpdateSportTypeBodyType,
} from "@/schemaValidations/sport-type.schema";
import {
  useGetSportTypeByIdQuery,
  useCreateSportTypeMutation,
  useUpdateSportTypeMutation,
} from "@/queries/useSportType";

// Context type that matches parent component
type SportTypeContextType = {
  sportTypeIdEdit: number | undefined;
  setSportTypeIdEdit: (value: number | undefined) => void;
  mode: "create" | "edit";
  setMode: (value: "create" | "edit") => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
};

// Use the context from the parent - it will be provided by SportTypeTableContext.Provider
export const SportTypeTableContext = React.createContext<SportTypeContextType>({
  sportTypeIdEdit: undefined,
  setSportTypeIdEdit: () => {},
  mode: "create",
  setMode: () => {},
  isDialogOpen: false,
  setIsDialogOpen: () => {},
});

export default function SportTypeFormDialog() {
  const {
    sportTypeIdEdit,
    setSportTypeIdEdit,
    mode,
    setMode,
    isDialogOpen,
    setIsDialogOpen,
  } = useContext(SportTypeTableContext);

  const createSportTypeMutation = useCreateSportTypeMutation();
  const updateSportTypeMutation = useUpdateSportTypeMutation();

  // Fetch sport type data when editing
  const { data: sportTypeData, isLoading: isLoadingSportType } =
    useGetSportTypeByIdQuery(
      sportTypeIdEdit!,
      mode === "edit" && !!sportTypeIdEdit
    );

  const form = useForm<CreateSportTypeBodyType | UpdateSportTypeBodyType>({
    resolver: zodResolver(
      mode === "create" ? CreateSportTypeBody : UpdateSportTypeBody
    ),
    defaultValues: {
      name: "",
      description: "",
      venuePrice: 0,
    },
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        name: "",
        description: "",
        venuePrice: 0,
      });
    } else if (mode === "edit" && sportTypeData?.payload?.data) {
      form.reset({
        name: sportTypeData.payload.data.name,
        description: sportTypeData.payload.data.description || "",
        venuePrice: sportTypeData.payload.data.price,
      });
    }
  }, [isDialogOpen, mode, sportTypeData, form]);

  const onSubmit = async (
    data: CreateSportTypeBodyType | UpdateSportTypeBodyType
  ) => {
    try {
      if (mode === "create") {
        await createSportTypeMutation.mutateAsync(
          data as CreateSportTypeBodyType
        );
      } else if (mode === "edit" && sportTypeIdEdit) {
        await updateSportTypeMutation.mutateAsync({
          id: sportTypeIdEdit,
          body: data as UpdateSportTypeBodyType,
        });
      }
      // Close dialog and reset state on success
      setIsDialogOpen(false);
      setSportTypeIdEdit(undefined);
      setMode("create");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form and state when dialog closes
      setSportTypeIdEdit(undefined);
      setMode("create");
      form.reset();
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSportTypeIdEdit(undefined);
    setMode("create");
    form.reset();
  };

  const isLoading =
    createSportTypeMutation.isPending || updateSportTypeMutation.isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm môn thể thao mới"
              : "Chỉnh sửa môn thể thao"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Điền thông tin để tạo môn thể thao mới."
              : "Cập nhật thông tin môn thể thao."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Tên môn thể thao *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên môn thể thao"
                      disabled={isLoading || isLoadingSportType}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả môn thể thao"
                      disabled={isLoading || isLoadingSportType}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venuePrice"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Giá (VNĐ) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nhập giá"
                      disabled={isLoading || isLoadingSportType}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingSportType}>
                {isLoading
                  ? "Đang xử lý..."
                  : mode === "create"
                  ? "Tạo mới"
                  : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
