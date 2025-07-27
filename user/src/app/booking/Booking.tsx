import { useGetCourtTimeByFieldId } from "@/queries/useCourt";
import React, { useEffect, useState } from "react";
import { CourtMap, TimeLineEl, TimeSlot } from "@/types/court";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BookingProps {
  fieldId: string;
  date: string;
  onSelectionChange?: (data: {
    selectedTimeslots: Map<string, { start_time: string; end_time: string }[]>;
    totalPrice: number;
  }) => void;
}

type SelectedTimeslots = Map<
  string,
  { start_time: string; end_time: string }[]
>;

export const Booking = ({
  fieldId,
  date,
  onSelectionChange,
  resetSignal,
}: BookingProps & { resetSignal: number }) => {
  const { data, error, isError, isLoading } = useGetCourtTimeByFieldId(
    fieldId,
    date
  );
  const [baseTimeLine, setBaseTimeLine] = useState<TimeLineEl[]>([]);
  const [courts, setCourts] = useState<CourtMap>({});
  const [selectedTimeslots, setSelectedTimeslots] = useState<SelectedTimeslots>(
    new Map()
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [errorApi, setErrorApi] = useState<boolean>(false);
  useEffect(() => {
    if (data?.status != 200) {
      setErrorApi(true);
    }
    if (data?.payload.data) {
      setBaseTimeLine(data?.payload.data.base_time_line);
      setCourts(data?.payload.data.courts);
      setErrorApi(false);
    }
  }, [data]);

  useEffect(() => {
    setSelectedTimeslots(new Map());
    setTotalPrice(0);
    if (onSelectionChange) {
      onSelectionChange({ selectedTimeslots: new Map(), totalPrice: 0 });
    }
  }, [resetSignal]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError || errorApi) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded">
        {`Sân chưa hoạt động vui lòng chọn sân khác`}
      </div>
    );
  }
  const handleCellClick = (courtId: string, timeSlot: TimeSlot): void => {
    const updatedSelectedTimeslots = new Map(selectedTimeslots);
    const selectedData = {
      start_time: timeSlot.start_time,
      end_time: timeSlot.end_time,
    };
    const existingTimeslots = updatedSelectedTimeslots.get(courtId) || [];
    const isSelected = existingTimeslots.some(
      (slot) =>
        slot.start_time === timeSlot.start_time &&
        slot.end_time === timeSlot.end_time
    );

    let newPrice = totalPrice;
    if (isSelected) {
      updatedSelectedTimeslots.set(
        courtId,
        existingTimeslots.filter(
          (slot) =>
            !(
              slot.start_time === timeSlot.start_time &&
              slot.end_time === timeSlot.end_time
            )
        )
      );
      newPrice -= timeSlot.price;
    } else {
      updatedSelectedTimeslots.set(courtId, [
        ...existingTimeslots,
        selectedData,
      ]);
      newPrice += timeSlot.price;
    }

    setSelectedTimeslots(updatedSelectedTimeslots);
    setTotalPrice(newPrice);

    if (onSelectionChange) {
      onSelectionChange({
        selectedTimeslots: updatedSelectedTimeslots,
        totalPrice: newPrice,
      });
    }
  };

  return (
    <div className="m-4">
      <Table className="border-separate border-spacing-0 text-center whitespace-nowrap w-full shadow-lg rounded-lg overflow-hidden">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="sticky left-0 z-20 bg-gray-100 border-l border-r border-t border-b border-gray-300 px-6 py-3 text-center font-semibold text-gray-700">
              Tên sân
            </TableHead>
            {baseTimeLine.map((item, idx) => (
              <TableHead
                key={idx}
                className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"
              >
                {item.time}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(courts).map(([courtId, court]) => (
            <TableRow
              key={courtId}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell className="sticky left-0 z-20 bg-white border-l border-r border-t border-b border-gray-300 px-6 py-3 text-center font-medium">
                {court.name}
              </TableCell>
              {court.time_slots.map((timeSlot, index) => {
                const isSelected = selectedTimeslots
                  .get(courtId)
                  ?.some(
                    (slot) =>
                      slot.start_time === timeSlot.start_time &&
                      slot.end_time === timeSlot.end_time
                  );
                const isLocked = timeSlot.status === "locked";

                return (
                  <TableCell
                    key={index}
                    onClick={() =>
                      !isLocked && handleCellClick(courtId, timeSlot)
                    }
                    colSpan={timeSlot.colspan}
                    className={`border border-gray-300 px-6 py-3 text-center cursor-pointer transition-all duration-200 
                      ${
                        isSelected
                          ? "bg-blue-100 hover:bg-blue-200"
                          : "hover:bg-gray-100"
                      } 
                      ${isLocked ? "bg-red-100 cursor-not-allowed" : ""}`}
                  >
                    {isLocked && (
                      <span className="text-xs text-red-600">Đã đặt</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
