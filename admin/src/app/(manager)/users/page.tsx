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
import { ArrowUpDown, Loader2, MoreHorizontal, SlidersHorizontal } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, UserResponse } from "@/types/user";
import { useContext, useState } from "react";
import { useDeleteUserMutation, useGetAllUserQuery, useUpRoleMutation } from "@/queries/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { FooterPaginationState } from "@/app/(manager)/components/footer-pagination-state";
import { useDebounce } from "@/hooks/use-debound";
import { useToast } from "@/hooks/use-toast";
import { handleErrorApi } from "@/lib/utils";
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

const UserTableContext = React.createContext<{
  userIdEdit: string | undefined;
  setUserIdEdit: (value: string) => void;
}>({
  userIdEdit: undefined,
  setUserIdEdit: (value: string | undefined) => {},
});

export default function UserPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [page, setPage] = useState<number>(1); // Initialize to page 1
  const [pageSize, setPageSize] = useState<number>(10);
  const [userIdEdit, setUserIdEdit] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState<string>("");
  const debounce = useDebounce(searchValue);

  // Role color configuration
  const getRoleColor = (role: string) => {
    const cleanRole = role.replace("ROLE_", "");

    switch (cleanRole.toUpperCase()) {
      case "ADMIN":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          label: "Quản trị viên",
        };
      case "OWNER":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          label: "Chủ sở hữu",
        };
      default:
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          label: "Người dùng",
        };
    }
  };

  // Custom sort handler that resets to page 1
  const handleSort = (column: any) => {
    column.toggleSorting(column.getIsSorted() === "asc");
    setPage(1); // Reset to page 1 when sorting
  };

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "realmRole",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="flex justify-center">
            <Button
              className="font-semibold"
              variant="ghost"
              onClick={() => handleSort(column)}
            >
              Vai trò
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
        const role = row.getValue("realmRole") as string;
        const roleConfig = getRoleColor(role);

        return (
          <div className="text-center font-medium">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}
            >
              {roleConfig.label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => handleSort(column)}>
            Họ tên
            <ArrowUpDown
              className={isSorted ? "text-blue-600" : "text-gray-400"}
            />
          </Button>
        );
      },
      sortingFn: "text",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="text-center">
            <Button
              className=""
              variant="ghost"
              onClick={() => handleSort(column)}
            >
              Email
              <ArrowUpDown
                className={isSorted ? "text-blue-600" : "text-gray-400"}
              />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div className="text-center">
            <Button
              className=""
              variant="ghost"
              onClick={() => handleSort(column)}
            >
              Số điện thoại
              <ArrowUpDown
                className={isSorted ? "text-blue-600" : "text-gray-400"}
              />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("phoneNumber") || "N/A"}
        </div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <UserActionsCell row={row} />,
    },
  ];




  const { data, isLoading } = useGetAllUserQuery({
    pageNo: page - 1,
    pageSize: pageSize,
    search: debounce,
    sortBy: sorting[0]?.id ?? "",
    sortDir: sorting[0]?.desc ? "DESC" : "ASC",
  });
  const users: User[] = data?.payload.content ?? [];
  const pageTotal = data?.payload.totalPages ?? 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    if (!searchValue.startsWith(" ")) {
      setSearchValue(searchValue);
      setPage(1); // Reset to page 1 when searching
    }
  };

  // Reset to page 1 when pageSize changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const table = useReactTable({
    data: users,
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
    <UserTableContext.Provider
      value={{
        userIdEdit,
        setUserIdEdit,
      }}
    >
      <div className="w-full">
        <div className="flex items-center py-4">
          <div className="flex gap-3 flex-1 ">
            <Input
              placeholder="Tìm kiếm theo họ tên, email, số điện thoại..."
              value={searchValue}
              onChange={handleChange}
              className="max-w-sm"
            />
          </div>

          <div className="flex gap-3">
            {/* <DetailForm id={userIdEdit} setId={setUserIdEdit} /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal />
                  Hiển thị
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    // Map column IDs to Vietnamese labels
                    const getColumnLabel = (columnId: string) => {
                      switch (columnId) {
                        case "realmRole":
                          return "Vai trò";
                        case "name":
                          return "Họ tên";
                        case "email":
                          return "Email";
                        case "phoneNumber":
                          return "Số điện thoại";
                        case "actions":
                          return "Hành động";
                        default:
                          return columnId;
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
                        {getColumnLabel(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
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
              {isLoading &&
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      {table.getAllColumns().map((_, index) => (
                        <TableCell key={index} className="text-center">
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
                : !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Không có kết quả.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Đã chọn {table.getFilteredSelectedRowModel().rows.length} trong{" "}
            {table.getFilteredRowModel().rows.length} hàng.
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
      </div>
    </UserTableContext.Provider>
  );
}

function UserActionsCell({ row }: { row: any }) {
  const { setUserIdEdit } = useContext(UserTableContext);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const [openConfirmUpRole, setOpenConfirmUpRole] = useState<boolean>(false);
  const { toast } = useToast();
  const upRoleMutation = useUpRoleMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const openDetail = () => {
    setUserIdEdit(row.original.id);
    setOpenDropdown(false);
  };

  const handleUpRole = async () => {
    try {
      await upRoleMutation.mutateAsync(row.original.id);
      toast({
        description: "Nâng quyền người dùng thành công",
      });
      setOpenConfirmUpRole(false);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(row.original.id);
      toast({
        description: "Xoá người dùng thành công",
      });
      setOpenConfirmDelete(false);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const userRole = row.original.realmRole;
  const isUser = userRole === "ROLE_USER";
  const isAdmin = userRole === "ROLE_ADMIN";

  if (isAdmin) return null;

  return (
    <>
      <AlertDialog open={openConfirmDelete} onOpenChange={setOpenConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xoá tài khoản người dùng "{row.original.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Huỷ</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận xoá
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openConfirmUpRole} onOpenChange={setOpenConfirmUpRole}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nâng quyền người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn nâng quyền người dùng "{row.original.name}" lên làm Chủ sân (Owner)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={upRoleMutation.isPending}>Huỷ</AlertDialogCancel>
            <Button
              onClick={handleUpRole}
              disabled={upRoleMutation.isPending}
            >
              {upRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận nâng quyền
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <DropdownMenuItem onClick={openDetail}>Chi tiết</DropdownMenuItem>
          {isUser && (
            <DropdownMenuItem
              className="text-yellow-600 focus:text-yellow-600"
              onSelect={(e) => {
                e.preventDefault();
                setOpenConfirmUpRole(true);
              }}
            >
              Nâng quyền
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault();
              setOpenConfirmDelete(true);
            }}
          >
            Xoá người dùng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
