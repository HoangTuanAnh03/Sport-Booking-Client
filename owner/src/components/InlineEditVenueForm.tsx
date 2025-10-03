"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UpdateVenueBody,
  UpdateVenueBodyType,
} from "@/schemaValidations/venue.schema";
import { useUpdateVenueMutation } from "@/queries/useVenue";
import { VenueDetail } from "@/types/venue";
import { useBanks } from "@/queries/useBank";
import { Bank } from "@/apiRequests/bank";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface InlineEditVenueFormProps {
  venue: VenueDetail;
  onVenueUpdated: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function InlineEditVenueForm({
  venue,
  onVenueUpdated,
  isEditing,
  setIsEditing,
}: InlineEditVenueFormProps) {
  const updateVenueMutation = useUpdateVenueMutation();
  const { data: bankResponse } = useBanks();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [value, setValue] = useState(venue.bankName || ""); // This will store the shortName
  const [displayValue, setDisplayValue] = useState(""); // This will store the display text

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue: setFormValue,
  } = useForm<UpdateVenueBodyType>({
    resolver: zodResolver(UpdateVenueBody),
  });

  // Reset form with venue data when editing starts or venue data changes
  useEffect(() => {
    if (isEditing) {
      reset({
        name: venue.name,
        address: venue.address,
        phoneNumber: venue.phoneNumber,
        bankName: venue.bankName, // This is the shortName from backend
        bankNumber: venue.bankNumber,
        bankHolderName: venue.bankHolderName,
      });

      // Set the display value based on the shortName
      if (venue.bankName) {
        setValue(venue.bankName);
        const bankData = bankResponse?.payload?.data.find(
          (bank: Bank) => bank.shortName === venue.bankName
        );
        if (bankData) {
          setDisplayValue(`${bankData.shortName} - ${bankData.name}`);
        } else {
          setDisplayValue(venue.bankName);
        }
      } else {
        setValue("");
        setDisplayValue("");
      }
    }
  }, [isEditing, venue, reset, bankResponse]);

  const onSubmit = async (data: UpdateVenueBodyType) => {
    try {
      await updateVenueMutation.mutateAsync({
        venueId: venue.id,
        body: data,
      });

      toast({
        title: "Thành công",
        description: "Thông tin địa điểm đã được cập nhật thành công",
      });

      setIsEditing(false);
      onVenueUpdated();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin địa điểm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  // Get banks data from response
  const banksData = bankResponse?.payload?.data || [];

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Tên địa điểm</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nhập tên địa điểm"
                disabled={updateVenueMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Nhập địa chỉ"
                disabled
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="Ví dụ: 0987654321"
                disabled={updateVenueMutation.isPending}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Số điện thoại phải theo định dạng của Việt Nam (10-11 chữ số)
              </p>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Thông tin thanh toán</h3>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bankName">Tên ngân hàng</Label>
              <Popover modal open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                    disabled={updateVenueMutation.isPending}
                  >
                    {displayValue ? displayValue : "Chọn ngân hàng..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Tìm kiếm ngân hàng..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                      <CommandGroup>
                        {banksData.map((bank: Bank) => (
                          <CommandItem
                            key={bank.id}
                            onSelect={() => {
                              // Store the shortName for backend
                              setValue(bank.shortName);
                              // Store the display text for UI
                              setDisplayValue(
                                `${bank.shortName} - ${bank.name}`
                              );
                              // Set the form value to shortName for submission
                              setFormValue("bankName", bank.shortName);
                              setOpenCombobox(false);
                            }}
                          >
                            {bank.shortName} - {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.bankName && (
                <p className="text-sm text-red-600">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bankNumber">Số tài khoản</Label>
              <Input
                id="bankNumber"
                {...register("bankNumber")}
                placeholder="Nhập số tài khoản"
                disabled={updateVenueMutation.isPending}
              />
              {errors.bankNumber && (
                <p className="text-sm text-red-600">
                  {errors.bankNumber.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bankHolderName">Chủ tài khoản</Label>
              <Input
                id="bankHolderName"
                {...register("bankHolderName")}
                placeholder="Nhập tên chủ tài khoản"
                disabled={updateVenueMutation.isPending}
              />
              {errors.bankHolderName && (
                <p className="text-sm text-red-600">
                  {errors.bankHolderName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateVenueMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Huỷ
          </Button>
          <Button type="submit" disabled={updateVenueMutation.isPending}>
            {updateVenueMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Lưu
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
          </div>

          <div className="grid gap-3">
            <Label>Tên địa điểm</Label>
            <div className="text-sm p-2 bg-muted rounded">{venue.name}</div>
          </div>

          <div className="grid gap-3">
            <Label>Địa chỉ</Label>
            <div className="text-sm p-2 bg-muted rounded">{venue.address}</div>
          </div>

          <div className="grid gap-3">
            <Label>Số điện thoại</Label>
            <div className="text-sm p-2 bg-muted rounded">
              {venue.phoneNumber}
            </div>
          </div>
        </div>

        {/* Payment Information Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Thông tin thanh toán</h3>
          </div>

          <div className="grid gap-3">
            <Label>Tên ngân hàng</Label>
            <div className="text-sm p-2 bg-muted rounded">
              {venue.bankName || "Chưa có thông tin"}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Số tài khoản</Label>
            <div className="text-sm p-2 bg-muted rounded">
              {venue.bankNumber || "Chưa có thông tin"}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Chủ tài khoản</Label>
            <div className="text-sm p-2 bg-muted rounded">
              {venue.bankHolderName || "Chưa có thông tin"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
