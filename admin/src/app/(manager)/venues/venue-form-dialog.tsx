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
import { Button } from "@/components/ui/button";
import {
  CreateVenueBody,
  UpdateVenueBody,
  CreateVenueBodyType,
  UpdateVenueBodyType,
} from "@/schemaValidations/venue.schema";
import {
  useGetVenueByIdQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
} from "@/queries/useVenue";

// Context type that matches parent component
type VenueContextType = {
  venueIdEdit: number | undefined;
  setVenueIdEdit: (value: number | undefined) => void;
  mode: "create" | "edit";
  setMode: (value: "create" | "edit") => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
};

// Use the context from the parent - it will be provided by VenueTableContext.Provider
export const VenueTableContext = React.createContext<VenueContextType>({
  venueIdEdit: undefined,
  setVenueIdEdit: () => {},
  mode: "create",
  setMode: () => {},
  isDialogOpen: false,
  setIsDialogOpen: () => {},
});

export default function VenueFormDialog() {
  const {
    venueIdEdit,
    setVenueIdEdit,
    mode,
    setMode,
    isDialogOpen,
    setIsDialogOpen,
  } = useContext(VenueTableContext);

  const createVenueMutation = useCreateVenueMutation();
  const updateVenueMutation = useUpdateVenueMutation();

  // Fetch venue data when editing
  const { data: venueData, isLoading: isLoadingVenue } = useGetVenueByIdQuery(
    venueIdEdit!,
    mode === "edit" && !!venueIdEdit
  );

  const form = useForm<CreateVenueBodyType | UpdateVenueBodyType>({
    resolver: zodResolver(
      mode === "create" ? CreateVenueBody : UpdateVenueBody
    ),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
      bankName: "",
      bankNumber: "",
      bankHolderName: "",
    },
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        name: "",
        address: "",
        phoneNumber: "",
        bankName: "",
        bankNumber: "",
        bankHolderName: "",
      });
    } else if (mode === "edit" && venueData?.payload?.data) {
      // Extract venue data from the response structure
      const venue = venueData.payload.data;
      form.reset({
        name: venue.name || "",
        address: venue.address || "",
        phoneNumber: venue.phoneNumber || "",
        // Note: Banking info might not be available in the response
        // You may need to adjust this based on the actual API response
        bankName: "",
        bankNumber: "",
        bankHolderName: "",
      });
    }
  }, [isDialogOpen, mode, venueData, form]);

  const onSubmit = async (data: CreateVenueBodyType | UpdateVenueBodyType) => {
    try {
      if (mode === "create") {
        await createVenueMutation.mutateAsync(data as CreateVenueBodyType);
      } else if (mode === "edit" && venueIdEdit) {
        await updateVenueMutation.mutateAsync({
          id: venueIdEdit,
          body: data as UpdateVenueBodyType,
        });
      }
      // Close dialog and reset state on success
      setIsDialogOpen(false);
      setVenueIdEdit(undefined);
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
      setVenueIdEdit(undefined);
      setMode("create");
      form.reset();
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setVenueIdEdit(undefined);
    setMode("create");
    form.reset();
  };

  const isLoading =
    createVenueMutation.isPending || updateVenueMutation.isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm địa điểm mới" : "Chỉnh sửa địa điểm"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Điền thông tin để tạo địa điểm mới."
              : "Cập nhật thông tin địa điểm."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Tên địa điểm *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên địa điểm"
                        disabled={isLoading || isLoadingVenue}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số điện thoại"
                        disabled={isLoading || isLoadingVenue}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Địa chỉ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập địa chỉ"
                      disabled={isLoading || isLoadingVenue}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Tên ngân hàng *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên ngân hàng"
                        disabled={isLoading || isLoadingVenue}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankNumber"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Số tài khoản ngân hàng *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số tài khoản"
                        disabled={isLoading || isLoadingVenue}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bankHolderName"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Tên chủ tài khoản *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên chủ tài khoản"
                      disabled={isLoading || isLoadingVenue}
                      {...field}
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
              <Button type="submit" disabled={isLoading || isLoadingVenue}>
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
