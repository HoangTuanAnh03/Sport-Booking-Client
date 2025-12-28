"use client";

import { useState } from "react";
import { useGetAdminPaymentHistoryQuery } from "@/queries/usePayment";
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
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debound";

export default function AdminPaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [month, setMonth] = useState<string>("ALL");
  const [year, setYear] = useState<string>("ALL");
  
  const debouncedSearch = useDebounce(search);

  const { data: historyData, isLoading, error } = useGetAdminPaymentHistoryQuery({
    pageNo: page - 1,
    pageSize,
    search: debouncedSearch,
    status: status === "ALL" ? undefined : status,
    month: month === "ALL" ? undefined : parseInt(month),
    year: year === "ALL" ? undefined : parseInt(year),
    sortBy: "createdAt",
    sortDir: "desc",
  });

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
      default:
        return null;
    }
  };

  const payments = historyData?.content || [];
  const totalPages = historyData?.totalPages || 0;
  const totalElements = historyData?.totalElements || 0;

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <div className="space-y-6 pt-4">
      {/* <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Lịch sử thanh toán hệ thống
          </h1>
          <p className="text-slate-500">
            Quản lý và theo dõi tất cả các giao dịch thanh toán từ các chủ sân.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <Receipt className="h-4 w-4 text-blue-600" />
          Tổng số: {totalElements} giao dịch
        </div>
      </div> */}

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm mã giao dịch..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Đang xử lý</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={month} onValueChange={(val) => { setMonth(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả tháng</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>Tháng {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={(val) => { setYear(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả năm</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>Năm {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setStatus("ALL");
                setMonth("ALL");
                setYear("ALL");
                setPage(1);
              }}
              className="text-slate-600"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.</p>
          </CardContent>
        </Card>
      ) : payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card
              key={payment.id}
              className="group bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <CardHeader className="pb-4 bg-slate-50/50">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">
                          Mã giao dịch: #{payment.code}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(payment.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(payment.status)}
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
                {payment.message && (
                  <p className="text-sm text-slate-600 mt-3 pl-12 border-l-2 border-slate-200 italic">
                    &ldquo;{payment.message}&rdquo;
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {payment.details.map((detail, detailIndex) => (
                  <div
                    key={detailIndex}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold">
                          {detail.venueName}
                        </h4>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(detail.totalAmount)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detail.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between text-sm bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.quantity} × {formatCurrency(item.perPrice)}
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
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-600">
                Trang <span className="font-semibold text-slate-900">{page}</span> trên <span className="font-semibold text-slate-900">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="h-9 px-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="h-9 px-4"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="pt-10 pb-10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Receipt className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                Không tìm thấy giao dịch nào
              </h3>
              <p className="text-slate-500 max-w-sm">
                Không có dữ liệu thanh toán phù hợp với bộ lọc hiện tại của bạn.
              </p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearch("");
                  setStatus("ALL");
                  setMonth("ALL");
                  setYear("ALL");
                }}
                className="mt-2 text-blue-600"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
