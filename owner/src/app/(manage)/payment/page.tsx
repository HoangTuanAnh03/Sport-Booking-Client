"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetOwnerVenuePaymentsQuery, useCreatePaymentMutation } from "@/queries/usePayment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Ban,
  Calendar,
  Loader2,
  FileText,
  History,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentPage() {
  const router = useRouter();
  const { data: payments, isLoading, error } = useGetOwnerVenuePaymentsQuery();
  const createPaymentMutation = useCreatePaymentMutation();
  const [selectedVenues, setSelectedVenues] = useState<Set<number>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSelectVenue = (venueId: number, checked: boolean) => {
    const newSelected = new Set(selectedVenues);
    if (checked) {
      newSelected.add(venueId);
    } else {
      newSelected.delete(venueId);
    }
    setSelectedVenues(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingVenues = payments?.filter(
        (v) => !v.isPaidThisMonth && v.totalAmountToPay > 0
      ) || [];
      setSelectedVenues(new Set(pendingVenues.map((v) => v.venueId)));
    } else {
      setSelectedVenues(new Set());
    }
  };

  const handleOpenConfirmDialog = () => {
    if (selectedVenues.size === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = () => {
    createPaymentMutation.mutate({
      venueIds: Array.from(selectedVenues),
      returnUrl: `${window.location.origin}/payment?status=success`,
      cancelUrl: `${window.location.origin}/payment?status=cancel`,
    });
    setShowConfirmDialog(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">
                Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string, isPaid: boolean, noPayment: boolean) => {
    if (isPaid) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Đã thanh toán
        </Badge>
      );
    }

    if (noPayment) {
      return
    }

    return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Chưa thanh toán
          </Badge>
      );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const pendingVenues = payments?.filter((v) => !v.isPaidThisMonth && v.totalAmountToPay > 0) || [];
  const totalPaymentDue = pendingVenues.reduce(
    (sum, venue) => sum + venue.totalAmountToPay,
    0
  );
  
  const selectedTotal = payments
    ?.filter((v) => selectedVenues.has(v.venueId))
    .reduce((sum, venue) => sum + venue.totalAmountToPay, 0) || 0;

  const allPendingSelected = pendingVenues.length > 0 && 
    pendingVenues.every((v) => selectedVenues.has(v.venueId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Quản lý thanh toán
              </h1>
              <p className="text-slate-600 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin thanh toán và lịch sử thanh toán
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/payment/history")}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <History className="h-4 w-4 mr-2" />
                Lịch sử thanh toán
              </Button>
              <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">
                    Tổng cần thanh toán
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(totalPaymentDue)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        {pendingVenues.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="select-all"
                    checked={allPendingSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Chọn tất cả ({pendingVenues.length} địa điểm chờ thanh toán)
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  {selectedVenues.size > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        Đã chọn {selectedVenues.size} địa điểm
                      </p>
                      <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatCurrency(selectedTotal)}
                      </p>
                    </div>
                  )}
                  <Button
                    size="lg"
                    disabled={selectedVenues.size === 0}
                    onClick={handleOpenConfirmDialog}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Thanh toán
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Cards Grid */}
        {payments && payments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {payments.map((venue) => {
              const canSelect = !venue.isPaidThisMonth && venue.totalAmountToPay > 0;
              const isSelected = selectedVenues.has(venue.venueId);

              return (
                <Card
                  key={venue.venueId}
                  className={`group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden ${
                    isSelected
                      ? "border-green-500 shadow-lg ring-2 ring-green-200"
                      : "border-slate-200 hover:border-green-300"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 ${
                      isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />

                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        {canSelect && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectVenue(venue.venueId, checked as boolean)
                            }
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        )}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-lg line-clamp-1">
                            {venue.venueName}
                          </CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(venue.status, venue.isPaidThisMonth, venue.totalAmountToPay === 0)}
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{venue.address}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Court Details */}
                    {venue.courtDetails.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Chi tiết thanh toán
                        </h4>
                        <div className="space-y-2">
                          {venue.courtDetails.map((court, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-green-50 rounded-lg border border-slate-200"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm text-slate-900">
                                  {court.sportTypeName}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {court.numberOfCourts} sân × {formatCurrency(court.pricePerCourt)}
                                </p>
                              </div>
                              <p className="font-bold text-green-600">
                                {formatCurrency(court.totalAmount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          Tổng cộng
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatCurrency(venue.totalAmountToPay)}
                        </span>
                      </div>
                    </div>

                    {venue.totalAmountToPay === 0 && !venue.isPaidThisMonth && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          Chưa phát sinh phí
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <CreditCard className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Không có dữ liệu thanh toán
                </h3>
                <p className="text-slate-500 max-w-md">
                  Hiện tại không có thông tin thanh toán nào cho các địa điểm
                  của bạn.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Xác nhận thanh toán
            </DialogTitle>
            <DialogDescription>
              Vui lòng xem lại thông tin các địa điểm cần thanh toán trước khi tiếp tục
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected Venues List */}
            <div className="space-y-3">
              {payments
                ?.filter((v) => selectedVenues.has(v.venueId))
                .map((venue) => (
                  <Card key={venue.venueId} className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 line-clamp-1">
                              {venue.venueName}
                            </h4>
                            <div className="flex items-start gap-2 mt-1">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-500" />
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {venue.address}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrency(venue.totalAmountToPay)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {venue.courtDetails.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-600">Chi tiết:</p>
                          {venue.courtDetails.map((court, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm bg-white/60 p-2 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-700">
                                  {court.sportTypeName}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({court.numberOfCourts} sân × {formatCurrency(court.pricePerCourt)})
                                </span>
                              </div>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(court.totalAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>

            {/* Summary */}
            <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Số lượng địa điểm:</span>
                    <span className="font-semibold">{selectedVenues.size} địa điểm</span>
                  </div>
                  <div className="h-px bg-green-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-800">
                      Tổng thanh toán:
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatCurrency(selectedTotal)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={createPaymentMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={createPaymentMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Xác nhận thanh toán
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
