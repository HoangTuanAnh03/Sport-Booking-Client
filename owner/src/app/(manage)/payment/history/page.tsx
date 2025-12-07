"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetPaymentHistoryQuery } from "@/queries/usePayment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: historyData, isLoading, error } = useGetPaymentHistoryQuery(currentPage, pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã thanh toán
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">
                  Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const payments = historyData?.content || [];
  const totalPages = historyData?.totalPages || 0;
  const totalElements = historyData?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/payment")}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Lịch sử thanh toán
              </h1>
              <p className="text-slate-600 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tổng số: {totalElements} giao dịch
              </p>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        {payments.length > 0 ? (
          <div className="space-y-6">
            {payments.map((payment) => (
              <Card
                key={payment.id}
                className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                          <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Mã giao dịch: #{payment.code}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 ml-12">
                        {payment.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(payment.status)}
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Payment Details */}
                  {payment.details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      className="p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-slate-900">
                            {detail.venueName}
                          </h4>
                        </div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(detail.totalAmount)}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {detail.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between text-sm bg-white/60 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                {item.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({item.quantity} × {formatCurrency(item.perPrice)})
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Trang {currentPage + 1} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <Receipt className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Chưa có lịch sử thanh toán
                </h3>
                <p className="text-slate-500 max-w-md">
                  Bạn chưa có giao dịch thanh toán nào.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
