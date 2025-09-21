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
import { BuildingIcon, CreditCardIcon } from "lucide-react";
import { useBanks } from "@/queries/useBank";
import { Bank } from "@/apiRequests/bank";
import { useCreateVenueMutation } from "@/queries/useVenue";
import { useDebounce } from "@/hooks/use-debounce";

// Define the type for Goong API autocomplete response
interface GoongAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVenueDialog({ open, onOpenChange }: AddVenueDialogProps) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [value, setValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [addressPredictions, setAddressPredictions] = useState<
    GoongAutocompletePrediction[]
  >([]);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const createVenueMutation = useCreateVenueMutation();

  const debouncedAddressInput = useDebounce(addressInput, 300);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue: setFormValue,
    watch,
  } = useForm<UpdateVenueBodyType>({
    resolver: zodResolver(UpdateVenueBody),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
      bankName: "",
      bankNumber: "",
      bankHolderName: "",
    },
  });

  // Watch the address field for changes
  const addressValue = watch("address");

  const { data: bankResponse, isLoading: isBanksLoading } = useBanks();

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!open) {
      reset();
      setValue("");
      setDisplayValue("");
      setAddressPredictions([]);
      setAddressInput("");
    }
  }, [open, reset]);

  // Handle address input change with debounce
  useEffect(() => {
    if (debouncedAddressInput.length > 2) {
      fetchAddressPredictions(debouncedAddressInput);
    } else {
      setAddressPredictions([]);
      setAddressOpen(false);
    }
  }, [debouncedAddressInput]);

  // Update address input when address field changes
  useEffect(() => {
    setAddressInput(addressValue || "");
  }, [addressValue]);

  const fetchAddressPredictions = async (input: string) => {
    try {
      // Using the API key from the example since we don't have access to environment variables
      const response = await fetch(
        `https://rsapi.goong.io/v2/place/autocomplete?input=${encodeURIComponent(
          input
        )}&api_key=U2CqVGZNVfeqc4PaP1WbYecnqNr59zcQmHHLmcCJ`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address predictions");
      }

      const data = await response.json();
      setAddressPredictions(data.predictions || []);
      setAddressOpen(true);
    } catch (error) {
      console.error("Error fetching address predictions:", error);
      setAddressPredictions([]);
    }
  };

  const handleAddressSelect = (prediction: GoongAutocompletePrediction) => {
    setFormValue("address", prediction.description);
    setAddressInput(prediction.description);
    setAddressOpen(false);
    setAddressPredictions([]); // Clear predictions after selection
  };

  const onSubmit = async (data: UpdateVenueBodyType) => {
    // Call the create venue mutation
    await createVenueMutation.mutateAsync(data);
    // Close the dialog after successful creation
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
            Thêm địa điểm mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản và thông tin thanh toán của địa điểm mới
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
                  disabled={createVenueMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Nhập địa chỉ"
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setFormValue("address", e.target.value);
                    }}
                    disabled={createVenueMutation.isPending}
                    className="w-full"
                    onFocus={() => {
                      if (
                        addressPredictions.length > 0 &&
                        addressInput.length > 2
                      ) {
                        setAddressOpen(true);
                      }
                    }}
                    onBlur={() => {
                      // Use a timeout to allow for item selection
                      setTimeout(() => setAddressOpen(false), 200);
                    }}
                  />
                  {addressOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {addressPredictions.map((prediction) => (
                        <div
                          key={prediction.place_id}
                          onMouseDown={(e) => {
                            // Prevent the input from losing focus
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormValue("address", prediction.description);
                            setAddressInput(prediction.description);
                            setAddressOpen(false);
                            setAddressPredictions([]);
                          }}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        >
                          <div className="font-medium">
                            {prediction.structured_formatting.main_text}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prediction.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                      {addressPredictions.length === 0 &&
                        addressInput.length > 2 && (
                          <div className="px-4 py-2 text-gray-500">
                            Không tìm thấy địa chỉ.
                          </div>
                        )}
                    </div>
                  )}
                </div>
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
                  disabled={createVenueMutation.isPending}
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
                      disabled={isBanksLoading || createVenueMutation.isPending}
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
                  disabled={createVenueMutation.isPending}
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
                  disabled={createVenueMutation.isPending}
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
              disabled={createVenueMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createVenueMutation.isPending}>
              {createVenueMutation.isPending ? "Đang thêm..." : "Thêm địa điểm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
