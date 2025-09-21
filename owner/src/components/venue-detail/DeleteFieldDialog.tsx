"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldOwnerResponse } from "@/types/field";

interface DeleteFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingField: FieldOwnerResponse | null;
  deleteFieldMutation: any;
  refetch: () => void;
}

export function DeleteFieldDialog({
  open,
  onOpenChange,
  deletingField,
  deleteFieldMutation,
  refetch,
}: DeleteFieldDialogProps) {
  const handleConfirmDeleteField = async () => {
    if (!deletingField) return;

    try {
      await deleteFieldMutation.mutateAsync(deletingField.id);
      onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa cụm sân</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa cụm sân{" "}
            <span className="font-semibold">{deletingField?.name}</span>? Hành
            động này không thể hoàn tác và sẽ xóa tất cả sân trong cụm sân này.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteFieldMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDeleteField}
            disabled={deleteFieldMutation.isPending}
          >
            {deleteFieldMutation.isPending ? (
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
