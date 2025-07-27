import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Field} from "@/types/field";
import React from "react";
import FieldCard from "@/components/FieldCard";


const dialogOverlayStyles = `
  [data-radix-dialog-overlay] {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(0, 0, 0, 0.5) !important;
  }
`;
interface FieldModalProps {
    data: Field[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function FieldModal({data, isOpen, setIsOpen}: FieldModalProps) {
    return (
        <>
            <style>{dialogOverlayStyles}</style>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="sm:max-w-[700px] bg-white rounded-xl shadow-2xl z-[1000] max-h-[70vh] flex flex-col"
                >
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="text-2xl font-bold text-gray-800">
                            Lựa chọn sân phù hợp
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-4">
                        {data.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 text-lg">
                                    Không có sân, vui lòng đặt sân khác.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Đóng
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 py-6">
                                {data.map((field) => (
                                    <FieldCard field={field}/>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}