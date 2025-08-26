"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SportTypeResponse } from "@/types/sport-type";
import { useContext, useState } from "react";
import {
  useGetAllSportTypesQuery,
  useDeleteSportTypeMutation,
} from "@/queries/useSportType";
import { Skeleton } from "@/components/ui/skeleton";
import { FooterPaginationState } from "@/app/(manager)/components/footer-pagination-state";
import { useDebounce } from "@/hooks/use-debound";
import SportTypeFormDialog, {
  SportTypeTableContext,
} from "./sport-type-form-dialog";

export default function SportTypePage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sportTypeIdEdit, setSportTypeIdEdit] = useState<number | undefined>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const debounce = useDebounce(searchValue);

  const deleteSportTypeMutation = useDeleteSportTypeMutation();

  // Custom sort handler that resets to page 1
  const handleSort = (column: any) => {
    column.toggleSorting(column.getIsSorted() === "asc");
    setPage(1);
  };

  const columns: ColumnDef<SportTypeResponse>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => handleSort(column)}>
              ID
              <ArrowUpDown
                className={`ml-2 h-4 w-4 ${
                  isSorted ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center font-mono">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => handleSort(column)}>
            Tên môn thể thao
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${
                isSorted ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => handleSort(column)}>
            Mô tả
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${
                isSorted ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.getValue("description") || "Không có mô tả"}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => handleSort(column)}>
              Giá (VNĐ)
              <ArrowUpDown
                className={`ml-2 h-4 w-4 ${
                  isSorted ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {Number(row.getValue("price")).toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const { setSportTypeIdEdit, setMode, setIsDialogOpen } = useContext(
          SportTypeTableContext
        );
        const [openDropdown, setOpenDropdown] = useState<boolean>(false);
        const [showDeleteDialog, setShowDeleteDialog] =
          useState<boolean>(false);

        const handleEdit = () => {
          setSportTypeIdEdit(row.original.id);
          setMode("edit");
          setIsDialogOpen(true);
          setOpenDropdown(false);
        };

        const handleDeleteClick = () => {
          setShowDeleteDialog(true);
          setOpenDropdown(false);
        };

        const handleDeleteConfirm = () => {
          deleteSportTypeMutation.mutate(row.original.id);
          setShowDeleteDialog(false);
        };

        return (
          <>
            <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-red-600"
                >
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa môn thể thao "
                    <strong>{row.original.name}</strong>" không? Hành động này
                    không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  const { data, isLoading, isFetching } = useGetAllSportTypesQuery({
    pageNo: page - 1,
    pageSize: pageSize,
    search: debounce,
    sortBy: sorting[0]?.id ?? "",
    sortDir: sorting[0]?.desc ? "DESC" : "ASC",
  });

  const sportTypes: SportTypeResponse[] = data?.payload?.content ?? [];
  const pageTotal = data?.payload?.totalPages ?? 1;

  // Only show skeleton on initial load, not on page changes
  const showSkeleton = isLoading && !data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    if (!searchValue.startsWith(" ")) {
      setSearchValue(searchValue);
      setPage(1);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleCreateNew = () => {
    setSportTypeIdEdit(undefined);
    setMode("create");
    setIsDialogOpen(true);
  };

  const table = useReactTable({
    data: sportTypes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <SportTypeTableContext.Provider
      value={{
        sportTypeIdEdit,
        setSportTypeIdEdit,
        mode,
        setMode,
        isDialogOpen,
        setIsDialogOpen,
      }}
    >
      <div className="w-full">
        <div className="flex items-center py-4">
          <div className="flex gap-3 flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, mô tả..."
              value={searchValue}
              onChange={handleChange}
              className="max-w-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm môn thể thao
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Hiển thị
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const getColumnDisplayName = (id: string) => {
                      switch (id) {
                        case "name":
                          return "Tên môn thể thao";
                        case "description":
                          return "Mô tả";
                        case "price":
                          return "Giá";
                        case "id":
                          return "ID";
                        case "actions":
                          return "Hành động";
                        default:
                          return id;
                      }
                    };

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(value)
                        }
                      >
                        {getColumnDisplayName(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border relative">
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200 rounded-t-md overflow-hidden z-10">
              <div className="h-full bg-blue-500 animate-pulse"></div>
            </div>
          )}
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {showSkeleton &&
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      {table.getAllColumns().map((_, cellIndex) => (
                        <TableCell key={cellIndex} className="text-center">
                          <Skeleton className="h-[30px] rounded-md mt-1" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

              {table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : !showSkeleton && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Không có dữ liệu.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} trong{" "}
            {table.getFilteredRowModel().rows.length} hàng được chọn.
          </div>
          <FooterPaginationState
            page={page}
            pageSize={pageSize}
            pageTotal={pageTotal}
            isLoading={isLoading}
            setPage={setPage}
            setPageSize={handlePageSizeChange}
          />
        </div>

        <SportTypeFormDialog />
      </div>
    </SportTypeTableContext.Provider>
  );
}
