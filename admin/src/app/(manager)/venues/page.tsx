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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VenueAdminResponse, VenueStatus } from "@/types/venue";
import { useContext, useState } from "react";
import {
  useSearchVenuesForAdminQuery,
  useDeleteVenueMutation,
  useUpdateVenueStatusMutation,
} from "@/queries/useVenue";
import { useGetAllSportTypesQuery } from "@/queries/useSportType";
import { Skeleton } from "@/components/ui/skeleton";
import { FooterPaginationState } from "@/app/(manager)/components/footer-pagination-state";
import { useDebounce } from "@/hooks/use-debound";
import VenueFormDialog, { VenueTableContext } from "./venue-form-dialog";
import { VenueFilter } from "./venue-filter";

const statusColors: Record<VenueStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  ENABLE: "bg-green-100 text-green-800 hover:bg-green-200",
  UNABLE: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  LOCK: "bg-red-100 text-red-800 hover:bg-red-200",
  UNPAID: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  DELETED: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  REJECTED: "bg-red-200 text-red-900 hover:bg-red-300",
};

const statusLabels: Record<VenueStatus, string> = {
  PENDING: "Chờ duyệt",
  ENABLE: "Hoạt động",
  UNABLE: "Chưa hoạt động",
  LOCK: "Khóa",
  UNPAID: "Chưa thanh toán",
  DELETED: "Đã xóa",
  REJECTED: "Bị từ chối",
};

export default function VenuePage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false, // Hide ID column by default
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [venueIdEdit, setVenueIdEdit] = useState<number | undefined>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<VenueStatus | "ALL">("ALL");
  const [isPaidFilter, setIsPaidFilter] = useState<boolean | "ALL">("ALL");
  const [typesFilter, setTypesFilter] = useState<number[]>([]);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const debounce = useDebounce(searchValue);

  const deleteVenueMutation = useDeleteVenueMutation();
  const updateVenueStatusMutation = useUpdateVenueStatusMutation();

  // Custom sort handler that resets to page 1
  const handleSort = (column: any) => {
    column.toggleSorting(column.getIsSorted() === "asc");
    setPage(1);
  };

  const columns: ColumnDef<VenueAdminResponse>[] = [
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
            Tên địa điểm
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${
                isSorted ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => handleSort(column)}>
            Địa chỉ
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${
                isSorted ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate">{row.getValue("address")}</div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue("phoneNumber")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => handleSort(column)}>
              Trạng thái
              <ArrowUpDown
                className={`ml-2 h-4 w-4 ${
                  isSorted ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as VenueStatus;
        return (
          <div className="text-center">
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "isPaid",
      header: () => (
        <div className="text-center">
          <span className="text-sm font-medium">Thanh toán</span>
        </div>
      ),
      cell: ({ row }) => {
        const isPaid = row.getValue("isPaid") as boolean;
        return (
          <div className="text-center">
            <Badge
              className={
                isPaid
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Badge>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const { setVenueIdEdit, setMode, setIsDialogOpen } =
          useContext(VenueTableContext);
        const [openDropdown, setOpenDropdown] = useState<boolean>(false);
        const [showDeleteDialog, setShowDeleteDialog] =
          useState<boolean>(false);
        const [showStatusDialog, setShowStatusDialog] =
          useState<boolean>(false);
        const [newStatus, setNewStatus] = useState<VenueStatus>("ENABLE");
        const [statusAction, setStatusAction] = useState<string>("");

        const currentStatus = row.original.status;

        // No actions for DELETED and REJECTED venues
        if (currentStatus === "DELETED" || currentStatus === "REJECTED") {
          return null;
        }

        // Define available actions based on current status
        const getAvailableActions = () => {
          const actions = [];

          // Always show edit action
          // actions.push({
          //   label: "Chỉnh sửa",
          //   action: "edit",
          //   className: "",
          // });

          // Status-specific actions
          switch (currentStatus) {
            case "PENDING":
              actions.push({
                label: "Duyệt sân",
                action: "approve",
                status: "ENABLE" as VenueStatus,
                className: "text-green-600",
              });
              actions.push({
                label: "Từ chối sân",
                action: "reject",
                status: "REJECTED" as VenueStatus,
                className: "text-red-600",
              });
              break;
            case "UNPAID":
              actions.push({
                label: "Đã thanh toán",
                action: "disable",
                status: "UNABLE" as VenueStatus,
                className: "text-orange-600",
              });
              break;
            case "ENABLE":
            case "UNABLE":
              actions.push({
                label: "Khóa sân",
                action: "lock",
                status: "LOCK" as VenueStatus,
                className: "text-red-600",
              });
              break;
            case "LOCK":
              actions.push({
                label: "Mở khóa sân",
                action: "unlock",
                status: "UNABLE" as VenueStatus,
                className: "text-blue-600",
              });
              break;
            // No additional status actions for DELETED and REJECTED
            default:
              break;
          }

          return actions;
        };

        const availableActions = getAvailableActions();

        const handleEdit = () => {
          setVenueIdEdit(row.original.id);
          setMode("edit");
          setIsDialogOpen(true);
          setOpenDropdown(false);
        };

        const handleDeleteClick = () => {
          setShowDeleteDialog(true);
          setOpenDropdown(false);
        };

        const handleStatusClick = (action: any) => {
          setNewStatus(action.status);
          setStatusAction(action.label);
          setShowStatusDialog(true);
          setOpenDropdown(false);
        };

        const handleDeleteConfirm = () => {
          deleteVenueMutation.mutate(row.original.id);
          setShowDeleteDialog(false);
        };

        const handleStatusConfirm = () => {
          updateVenueStatusMutation.mutate({
            id: row.original.id,
            status: newStatus,
          });
          setShowStatusDialog(false);
        };

        // If no actions available (only edit), don't show dropdown
        if (
          availableActions.length === 1 &&
          availableActions[0].action === "edit"
        ) {
          return (
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleEdit}
            >
              <span className="sr-only">Chỉnh sửa</span>
              <MoreHorizontal />
            </Button>
          );
        }

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
                {availableActions.map((action, index) => {
                  if (action.action === "edit") {
                    return (
                      <DropdownMenuItem key={index} onClick={handleEdit}>
                        {action.label}
                      </DropdownMenuItem>
                    );
                  } else if (action.action === "delete") {
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={handleDeleteClick}
                        className={action.className}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    );
                  } else {
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleStatusClick(action)}
                        className={action.className}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    );
                  }
                })}
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
                    Bạn có chắc chắn muốn xóa địa điểm "
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

            <AlertDialog
              open={showStatusDialog}
              onOpenChange={setShowStatusDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Xác nhận thay đổi trạng thái
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn thực hiện hành động "
                    <strong>{statusAction}</strong>" cho địa điểm "
                    <strong>{row.original.name}</strong>" không?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStatusConfirm}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  const { data, isLoading, isFetching } = useSearchVenuesForAdminQuery({
    pageNo: page - 1,
    pageSize: pageSize,
    search: debounce,
    sortBy: sorting[0]?.id ?? "",
    sortDir: sorting[0]?.desc ? "DESC" : "ASC",
    status: statusFilter === "ALL" ? undefined : statusFilter,
    isPaid: isPaidFilter === "ALL" ? undefined : isPaidFilter,
    types: typesFilter.length > 0 ? typesFilter : undefined,
  });

  // Fetch sport types for filtering
  const { data: sportTypesData } = useGetAllSportTypesQuery({
    pageSize: 100, // Get all sport types
  });

  const venues: VenueAdminResponse[] = data?.payload?.content ?? [];
  const pageTotal = data?.payload?.totalPages ?? 1;
  const sportTypes = sportTypesData?.payload?.content ?? [];

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

  // const handleCreateNew = () => {
  //   setVenueIdEdit(undefined);
  //   setMode("create");
  //   setIsDialogOpen(true);
  // };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as VenueStatus | "ALL");
    setPage(1);
  };

  const handlePaidFilterChange = (value: boolean | "ALL") => {
    setIsPaidFilter(value);
    setPage(1);
  };

  const handleTypesFilterChange = (selectedTypes: number[]) => {
    setTypesFilter(selectedTypes);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchValue("");
    setStatusFilter("ALL");
    setIsPaidFilter("ALL");
    setTypesFilter([]);
    setPage(1);
  };

  const hasActiveFilters =
    searchValue !== "" ||
    statusFilter !== "ALL" ||
    isPaidFilter !== "ALL" ||
    typesFilter.length > 0;

  const table = useReactTable({
    data: venues,
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
    <VenueTableContext.Provider
      value={{
        venueIdEdit,
        setVenueIdEdit,
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
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              value={searchValue}
              onChange={handleChange}
              className="max-w-sm"
            />
            <VenueFilter
              statusFilter={statusFilter}
              isPaidFilter={isPaidFilter}
              typesFilter={typesFilter}
              sportTypes={sportTypes}
              onStatusFilterChange={handleStatusFilterChange}
              onPaidFilterChange={handlePaidFilterChange}
              onTypesFilterChange={handleTypesFilterChange}
              onClearAllFilters={handleClearAllFilters}
            />
          </div>

          <div className="flex gap-3">
            {/* <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm địa điểm
            </Button> */}
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
                          return "Tên địa điểm";
                        case "address":
                          return "Địa chỉ";
                        case "phoneNumber":
                          return "Số điện thoại";
                        case "status":
                          return "Trạng thái";
                        case "isPaid":
                          return "Thanh toán";
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

        <VenueFormDialog />
      </div>
    </VenueTableContext.Provider>
  );
}
