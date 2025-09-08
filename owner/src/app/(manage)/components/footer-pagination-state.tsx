"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function FooterPaginationState({
  page,
  pageSize,
  pageTotal,
  isLoading,
  setPage,
  setPageSize,
}: {
  page: number;
  pageSize: number;
  pageTotal: number;
  isLoading: boolean;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
}) {
  const handleFirstPage = () => {
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pageTotal) {
      setPage(page + 1);
    }
  };

  const handleLastPage = () => {
    setPage(pageTotal);
  };

  return (
    <div className="space-x-2 flex items-center text-sm gap-8">
      <div className="flex items-center gap-2">
        <span className="text-slate-800">Số hàng mỗi trang</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-fit gap-2">
            {isLoading ? (
              <Skeleton className=" h-6 w-8 rounded-md" />
            ) : (
              <SelectValue placeholder={pageSize} />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-[30px] w-[100px] rounded-md" />
      ) : (
        <div>
          Trang {page} trong {pageTotal} trang
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page < 2}
          onClick={handleFirstPage}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page < 2}
          onClick={handlePreviousPage}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= pageTotal}
          onClick={handleNextPage}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= pageTotal}
          onClick={handleLastPage}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
