"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  UpdateVenueBody,
  UpdateVenueBodyType,
} from "@/schemaValidations/venue.schema";
import { useUpdateVenueMutation } from "@/queries/useVenue";
import { VenueDetail } from "@/types/venue";
import { BuildingIcon, CreditCardIcon } from "lucide-react";
import { useBanks } from "@/queries/useBank";
import { Bank } from "@/apiRequests/bank";

interface EditVenueDialogProps {
  venue: VenueDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVenueDialog({
  venue,
  open,
  onOpenChange,
}: EditVenueDialogProps) {
  const updateVenueMutation = useUpdateVenueMutation();
  const { data: bankResponse, isLoading: isBanksLoading } = useBanks();
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

  // Reset form with venue data when dialog opens or venue data changes
  useEffect(() => {
    if (open && venue) {
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
  }, [open, venue, reset, bankResponse]);

  const onSubmit = async (data: UpdateVenueBodyType) => {
    // Send the shortName to backend
    await updateVenueMutation.mutateAsync({
      venueId: venue.id,
      body: data,
    });
    // Close dialog only on successful update
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      reset();
    }
    onOpenChange(newOpen);
  };

  // Get banks data from response
  const banksData = bankResponse?.payload?.data || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Chỉnh sửa thông tin địa điểm
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cơ bản và thông tin thanh toán của địa điểm
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BuildingIcon className="h-4 w-4" />
                Thông tin cơ bản
              </h3>

              <div className="grid gap-3">
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

              <div className="grid gap-3">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Nhập địa chỉ"
                  disabled={updateVenueMutation.isPending}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="Nhập số điện thoại"
                  disabled={updateVenueMutation.isPending}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Thông tin thanh toán
              </h3>

              <div className="grid gap-3">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Popover
                  modal
                  open={openCombobox}
                  onOpenChange={setOpenCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                      disabled={isBanksLoading || updateVenueMutation.isPending}
                    >
                      {displayValue ? displayValue : "Chọn ngân hàng..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                          {isBanksLoading ? (
                            <CommandItem disabled>
                              Đang tải ngân hàng...
                            </CommandItem>
                          ) : (
                            banksData.map((bank: Bank) => (
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
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    value === bank.shortName
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))
                          )}
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

              <div className="grid gap-3">
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

              <div className="grid gap-3">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateVenueMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={updateVenueMutation.isPending}>
              {updateVenueMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
