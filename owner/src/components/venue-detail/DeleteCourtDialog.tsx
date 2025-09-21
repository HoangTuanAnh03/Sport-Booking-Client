"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourtResponse } from "@/types/field";

interface DeleteCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingCourt: CourtResponse | null;
  deleteCourtMutation: any;
  refetch: () => void;
}

export function DeleteCourtDialog({
  open,
  onOpenChange,
  deletingCourt,
  deleteCourtMutation,
  refetch,
}: DeleteCourtDialogProps) {
  const handleConfirmDeleteCourt = async () => {
    if (!deletingCourt) return;

    try {
      await deleteCourtMutation.mutateAsync(deletingCourt.id);
      onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Error deleting court:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa sân</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sân{" "}
            <span className="font-semibold">{deletingCourt?.name}</span>? Hành
            động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteCourtMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDeleteCourt}
            disabled={deleteCourtMutation.isPending}
          >
            {deleteCourtMutation.isPending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xóa...
              </span>
            ) : (
              "Xóa"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
