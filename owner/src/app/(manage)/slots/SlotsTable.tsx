import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/components/app-provider";
import { CourtSlots, CourtSlotsByField } from "@/types/field";
import {
  formatTime,
  generateTimeLine,
  toMinutes,
  parseTime,
} from "@/utils/time-utils";
import {
  useLockCourtSlotMutation,
  useUnlockCourtSlotMutation,
  useMergeCourtSlotMutation,
  useUnmergeCourtSlotMutation, // Import mutation hook mới
} from "@/queries/useSlot";
import {
  LockCourtSlotRequest,
  UnlockCourtSlotRequest,
  MergeCourtSlotRequest,
} from "@/types/slot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { time } from "console";

interface SlotItem {
  id?: number;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  isMerged: boolean;
  status: string;
  key: string;
}

// Hàm tạo key duy nhất cho mỗi slot từ courtId và startTime
const createSlotKey = (
  courtId: number,
  startTime: { hour: number; minute: number }
): string => {
  return `${courtId}-${startTime.hour}-${startTime.minute}`;
};

interface SlotsTableProps {
  fieldDetails: CourtSlotsByField | undefined;
  selectedDate: string;
}

const SlotsTable: React.FC<SlotsTableProps> = ({
  fieldDetails,
  selectedDate,
}) => {
  const slotsLoading = !fieldDetails;
  const sidebar_state = useAppStore((state) => state.sidebarOpen);
  const courts = useMemo(() => fieldDetails?.courts || [], [fieldDetails]);

  const [selectedSlotsV2, setSelectedSlotsV2] = useState<
    Map<number, SlotItem[]>
  >(new Map());
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);

  const lockSlotMutation = useLockCourtSlotMutation();
  const unlockSlotMutation = useUnlockCourtSlotMutation();
  const mergeSlotMutation = useMergeCourtSlotMutation();
  const unmergeSlotMutation = useUnmergeCourtSlotMutation(); // Add unmerge mutation

  const baseTimeLine = useMemo(() => {
    if (!fieldDetails) return [];
    const openTime = formatTime(fieldDetails.openTime);
    const closeTime = formatTime(fieldDetails.closeTime);
    return generateTimeLine(
      openTime,
      closeTime,
      fieldDetails.minBookingMinutes || 60
    );
  }, [fieldDetails]);

  // Hàm chuyển đổi định dạng thời gian cho API
  const formatTimeForApi = (time: { hour: number; minute: number }): string => {
    const hour = time.hour.toString().padStart(2, "0");
    const minute = time.minute.toString().padStart(2, "0");
    return `${hour}:${minute}:00`; // Format "hh:mm:ss"
  };

  // Hàm để toggle slot (thêm/xóa khỏi danh sách đã chọn)
  const toggleSlotSelection = (courtId: number, slot: CourtSlots) => {
    // Chuyển đổi startTime và endTime từ string sang object nếu cần
    const startTimeObj =
      typeof slot.startTime === "string"
        ? parseTime(slot.startTime)
        : slot.startTime;

    const endTimeObj =
      typeof slot.endTime === "string" ? parseTime(slot.endTime) : slot.endTime;

    // Tạo key duy nhất cho slot này
    const slotKey = createSlotKey(courtId, startTimeObj);
    const existingSlotIndex =
      selectedSlotsV2.get(courtId)?.findIndex((item) => item.key === slotKey) ??
      -1;

    if (existingSlotIndex >= 0) {
      // Nếu đã chọn rồi thì xóa khỏi danh sách
      const newSelectedSlotsV2 = new Map(selectedSlotsV2);
      const slotsForCourt = newSelectedSlotsV2.get(courtId) || [];
      slotsForCourt.splice(existingSlotIndex, 1);
      if (slotsForCourt.length > 0) {
        newSelectedSlotsV2.set(courtId, slotsForCourt);
      } else {
        newSelectedSlotsV2.delete(courtId);
      }
      setSelectedSlotsV2(newSelectedSlotsV2);
    } else {
      // Nếu chưa chọn thì thêm vào danh sách
      const newSelectedSlotsV2 = new Map(selectedSlotsV2);
      const slotsForCourt = newSelectedSlotsV2.get(courtId) || [];
      slotsForCourt.push({
        id: slot.id ? Number(slot.id) : undefined,
        startTime: startTimeObj,
        endTime: endTimeObj,
        isMerged: slot.isMerge,
        status: slot.status,
        key: slotKey,
      });
      // Sắp xếp theo startTime tăng dần
      slotsForCourt.sort((a, b) => {
        const aMinutes = a.startTime.hour * 60 + a.startTime.minute;
        const bMinutes = b.startTime.hour * 60 + b.startTime.minute;
        return aMinutes - bMinutes;
      });
      newSelectedSlotsV2.set(courtId, slotsForCourt);
      setSelectedSlotsV2(newSelectedSlotsV2);
    }
  };

  // Kiểm tra xem một slot đã được chọn chưa
  const isSlotSelected = (slot: CourtSlots, courtId: number) => {
    const startTimeObj =
      typeof slot.startTime === "string"
        ? parseTime(slot.startTime)
        : slot.startTime;

    const slotKey = createSlotKey(courtId, startTimeObj);
    return selectedSlotsV2.get(courtId)?.find((item) => item.key === slotKey);
  };

  // Hàm kiểm tra điều kiện disable nút Gộp
  const isMergeDisabled = () => {
    if (selectedSlotsV2.size !== 1) return true;
    const slots = Array.from(selectedSlotsV2.values())[0];
    if (!slots || slots.length < 2) return true;
    if (slots.some((slot) => slot.status !== "AVAILABLE")) return true;

    // slots đã được sắp xếp theo startTime
    return !slots.every((slot, i, arr) => {
      if (i === 0) return true;
      const prev = arr[i - 1];
      return (
        prev.endTime.hour === slot.startTime.hour &&
        prev.endTime.minute === slot.startTime.minute
      );
    });
  };

  // Hàm kiểm tra điều kiện disable nút Bỏ gộp
  const isUnmergeDisabled = () => {
    if (selectedSlotsV2.size !== 1) return true;
    const slots = Array.from(selectedSlotsV2.values())[0];
    if (!slots || slots.length !== 1) return true;
    if (!slots[0].isMerged) return true;
    return false;
  };

  // Hàm xác nhận merge các slot đã chọn
  const confirmMergeSlots = async () => {
    const slotsForCourt0 = Array.from(selectedSlotsV2.values())[0];
    const courtId = Array.from(selectedSlotsV2.keys())[0];
    if (!fieldDetails || !slotsForCourt0 || slotsForCourt0.length < 2) return;

    try {
      // Lấy thời gian bắt đầu từ slot đầu tiên và thời gian kết thúc từ slot cuối cùng
      const firstSlot = slotsForCourt0[0];
      const lastSlot = slotsForCourt0[slotsForCourt0.length - 1];

      // Tạo request body
      const mergeRequest: MergeCourtSlotRequest = {
        date: selectedDate,
        courtId: courtId,
        startTime: formatTimeForApi(firstSlot.startTime),
        endTime: formatTimeForApi(lastSlot.endTime),
      };

      await mergeSlotMutation.mutateAsync(mergeRequest);
      toast({
        title: "Thành công",
        description: `Đã gộp ${
          Array.from(selectedSlotsV2.values())[0].length
        } slot`,
      });

      setIsMergeDialogOpen(false);
      setSelectedSlotsV2(new Map());
    } catch (error) {
      console.error("Lỗi khi gộp slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gộp các slot. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  // Hàm xác nhận khóa các slot đã chọn
  const confirmLockSlots = async () => {
    if (!fieldDetails || selectedSlotsV2.size === 0) return;

    try {
      const lockRequest: LockCourtSlotRequest = {
        date: selectedDate, // Đảm bảo có date
        fieldId: fieldDetails.id,
        courts: Array.from(selectedSlotsV2.entries()).map(
          ([courtId, slots]) => ({
            id: courtId,
            timeSlots: slots.map((slot) => ({
              id: slot.id || 0,
              startTime: formatTimeForApi(slot.startTime), // Chuyển đổi sang định dạng hh:mm:ss
              endTime: formatTimeForApi(slot.endTime), // Chuyển đổi sang định dạng hh:mm:ss
            })),
          })
        ),
      };

      await lockSlotMutation.mutateAsync(lockRequest);
      toast({
        title: "Thành công",
        description: `Đã khóa khung giờ`,
      });

      // Đóng dialog và xóa danh sách slots đã chọn
      setIsLockDialogOpen(false);
      setSelectedSlotsV2(new Map());
    } catch (error) {
      console.error("Lỗi khi khóa slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể khóa các slot. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  // Thêm hàm xác nhận mở khóa các slot đã chọn
  const confirmUnlockSlots = async () => {
    if (!fieldDetails || selectedSlotsV2.size === 0) return;

    try {
      const unlockRequest: UnlockCourtSlotRequest = {
        date: selectedDate,
        fieldId: fieldDetails.id,
        courts: Array.from(selectedSlotsV2.entries()).map(
          ([courtId, slots]) => ({
            id: courtId,
            slotIds: slots.map((slot) => slot.id || 0),
          })
        ),
      };

      await unlockSlotMutation.mutateAsync(unlockRequest);
      toast({
        title: "Thành công",
        description: `Đã mở khóa khung giờ`,
      });

      setIsUnlockDialogOpen(false);
      setSelectedSlotsV2(new Map());
    } catch (error) {
      console.error("Lỗi khi mở khóa slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể mở khóa các slot. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  // Hàm xác nhận huỷ gộp slot
  const confirmUnmergeSlot = async () => {
    if (!fieldDetails || selectedSlotsV2.size === 0) return;

    try {
      await unmergeSlotMutation.mutateAsync(
        Array.from(selectedSlotsV2.values())[0].at(0)?.id || 0
      );
      toast({
        title: "Thành công",
        description: "Đã huỷ gộp slot thành công",
      });
      setSelectedSlotsV2(new Map());
    } catch (error) {
      console.error("Lỗi khi huỷ gộp slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể huỷ gộp slot. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  if (slotsLoading) {
    return (
      <div className="relative overflow-x-auto">
        <Table className="border-separate border-spacing-0 text-center whitespace-nowrap w-full shadow-lg rounded-lg">
          <TableHeader>
            <TableRow className="bg-cyan-200">
              <TableHead className="border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"></TableHead>
              {Array.from({ length: 12 }, (_, idx) => (
                <TableHead
                  key={idx}
                  className="border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 w-24"
                >
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }, (_, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="sticky left-0 z-20 bg-cyan-200 border-l border-t border-b border-gray-300 px-6 py-3 text-center font-medium w-32">
                  <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                {Array.from({ length: 12 }, (_, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className="border border-gray-300 px-6 py-3 text-center w-24"
                  >
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (fieldDetails && courts.length > 0) {
    return (
      <div>
        <div
          className="w-full overflow-x-auto"
          style={{
            maxWidth: `calc(100vw - ${sidebar_state ? 255 : 48}px - 34px)`,
          }}
        >
          <Table className="border-collapse  border-spacing-0 text-center whitespace-nowrap min-w-max shadow-lg rounded-lg">
            <TableHeader>
              <TableRow className="bg-cyan-200">
                <TableHead className="border-gray-300 bg-cyan-200 px-6 py-3 text-center font-semibold text-gray-700"></TableHead>
                {baseTimeLine.map((item, idx) => (
                  <TableHead
                    key={idx}
                    className="-translate-x-1/2 bg-cyan-200 border-gray-300 px-3 py-3 text-center font-semibold text-gray-700"
                  >
                    {item.time}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court) => (
                <TableRow
                  key={court.id}
                  className="hover:bg-gray-50 transition-colors "
                >
                  <TableCell className="sticky left-0 z-20 bg-cyan-200 border-l border-t border-b border-gray-300 px-6 py-3 text-center font-medium">
                    {court.name}
                  </TableCell>
                  {court.slots?.map((timeSlot: CourtSlots, index: number) => {
                    const step = Number(fieldDetails?.minBookingMinutes) || 60;
                    const startTime = formatTime(timeSlot.startTime);
                    const endTime = formatTime(timeSlot.endTime);
                    const colspan =
                      (toMinutes(endTime) - toMinutes(startTime)) / step;

                    const isSelected = isSlotSelected(
                      timeSlot,
                      Number(court.id)
                    );

                    return (
                      <TableCell
                        key={index}
                        colSpan={colspan}
                        onClick={() => {
                          toggleSlotSelection(court.id, timeSlot);
                        }}
                        className={`border border-green-300 border-dashed  cursor-pointer px-3 py-3 text-center transition-all duration-200 ${
                          timeSlot.status === "AVAILABLE"
                            ? "bg-white hover:bg-green-100"
                            : timeSlot.status === "LOCK"
                            ? "bg-gray-400"
                            : timeSlot.status === "PAID"
                            ? "bg-red-500 hover:bg-red-400"
                            : "bg-yellow-500 hover:bg-yellow-400"
                        } ${
                          isSelected
                            ? "border-solid border-4 border-green-400"
                            : ""
                        }`}
                      >
                        <div className="text-xs">
                          {timeSlot.price?.toLocaleString()}đ
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex gap-3 my-4">
          {/* Nút Khóa slot */}
          <Button
            variant="default"
            onClick={() => setIsLockDialogOpen(true)}
            disabled={
              Array.from(selectedSlotsV2.values()).flat().length === 0 ||
              Array.from(selectedSlotsV2.values())
                .flat()
                .some((slot) => slot.status === "LOCK")
            }
          >
            Khóa
          </Button>

          {/* Nút Mở khóa slot */}
          <Button
            variant="default"
            onClick={() => setIsUnlockDialogOpen(true)}
            disabled={
              Array.from(selectedSlotsV2.values()).flat().length === 0 ||
              Array.from(selectedSlotsV2.values())
                .flat()
                .some((slot) => slot.status !== "LOCK")
            }
          >
            Mở khóa
          </Button>

          {/* Nút Gộp slot */}
          <Button
            variant={"default"}
            onClick={() => setIsMergeDialogOpen(true)}
            disabled={isMergeDisabled()}
          >
            Gộp
          </Button>
          {/* Nút Bỏ gộp slot */}
          <Button
            variant="default"
            onClick={() => confirmUnmergeSlot()}
            disabled={isUnmergeDisabled()}
          >
            Bỏ gộp
          </Button>
        </div>
        {/* Dialog xác nhận khóa các slot đã chọn */}
        <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận khóa slot</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn khóa những khung giờ sau đây?
              </DialogDescription>
            </DialogHeader>

            {/* Danh sách các slot đã chọn */}
            <div className="max-h-64 overflow-y-auto">
              {Array.from(selectedSlotsV2.entries()).map(([courtId, slots]) => {
                const courtName =
                  courts.find((court) => court.id === courtId)?.name ||
                  "Sân không xác định";
                return (
                  <div key={courtId} className="mb-3">
                    <h4 className="font-medium text-sm">{courtName}</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {slots.map((slot: SlotItem, idx: number) => (
                        <li key={slot.key} className="text-sm">
                          {`${slot.startTime.hour
                            .toString()
                            .padStart(2, "0")}:${slot.startTime.minute
                            .toString()
                            .padStart(2, "0")}`}
                          {` - `}
                          {`${slot.endTime.hour
                            .toString()
                            .padStart(2, "0")}:${slot.endTime.minute
                            .toString()
                            .padStart(2, "0")}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsLockDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={confirmLockSlots}
                disabled={lockSlotMutation.isPending}
              >
                {lockSlotMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận mở khóa các slot đã chọn */}
        <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận mở khóa slot</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn mở khóa khung giờ sau đây?
              </DialogDescription>
            </DialogHeader>

            {/* Danh sách các slot đã chọn để mở khóa */}
            <div className="max-h-64 overflow-y-auto">
              {Array.from(selectedSlotsV2.entries()).map(([courtId, slots]) => {
                const courtName =
                  courts.find((court) => court.id === courtId)?.name ||
                  "Sân không xác định";
                return (
                  <div key={courtId} className="mb-3">
                    <h4 className="font-medium text-sm">{courtName}</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {slots
                        .filter((slot) => slot.status === "LOCK")
                        .map((slot: SlotItem) => (
                          <li key={slot.key} className="text-sm">
                            {`${slot.startTime.hour
                              .toString()
                              .padStart(2, "0")}:${slot.startTime.minute
                              .toString()
                              .padStart(2, "0")}`}
                            {` - `}
                            {`${slot.endTime.hour
                              .toString()
                              .padStart(2, "0")}:${slot.endTime.minute
                              .toString()
                              .padStart(2, "0")}`}
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsUnlockDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={confirmUnlockSlots}
                disabled={unlockSlotMutation.isPending}
              >
                {unlockSlotMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận gộp các slot đã chọn */}
        <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận gộp slot</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn gộp các khung giờ sau đây thành 1 slot?
              </DialogDescription>
            </DialogHeader>

            {/* Danh sách các slot đã chọn */}
            <div className="max-h-64 overflow-y-auto">
              {Array.from(selectedSlotsV2.entries()).map(([courtId, slots]) => {
                const courtName =
                  courts.find((court) => court.id === courtId)?.name ||
                  "Sân không xác định";
                return (
                  <div key={courtId} className="mb-3">
                    <h4 className="font-medium text-sm">{courtName}</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {slots.map((slot: SlotItem) => (
                        <li key={slot.key} className="text-sm">
                          {`${slot.startTime.hour
                            .toString()
                            .padStart(2, "0")}:${slot.startTime.minute
                            .toString()
                            .padStart(2, "0")}`}
                          {` - `}
                          {`${slot.endTime.hour
                            .toString()
                            .padStart(2, "0")}:${slot.endTime.minute
                            .toString()
                            .padStart(2, "0")}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsMergeDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={confirmMergeSlots}
                disabled={mergeSlotMutation.isPending}
              >
                {mergeSlotMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-gray-500">
      Trong cụm sân chưa có sân con nào.
    </div>
  );
};

export default SlotsTable;
