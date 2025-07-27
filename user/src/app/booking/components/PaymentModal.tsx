import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PaymentInf } from "@/types/court";
import {useEffect, useState} from "react";

type PaymentModalProps = {
    paymentInfo: PaymentInf | undefined;
    open: boolean;
    onClose: () => void;
    onConfirm: (bookingId?: string) => void;
};

const PaymentModal = ({
                          paymentInfo,
                          open,
                          onClose,
                          onConfirm,
                      }: PaymentModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsSubmitting(false);
        }
    }, [open]);

    const handleConfirm = () => {
        setIsSubmitting(true);
        onConfirm(paymentInfo?.booking_id)
    }


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-center">Thông tin thanh toán</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div>
                            <Label>Ngân hàng:</Label>
                            <p>{paymentInfo?.bank_name}</p>
                        </div>
                        <div>
                            <Label>Số tài khoản:</Label>
                            <p>{paymentInfo?.bank_account}</p>
                        </div>
                        <div>
                            <Label>Tổng tiền:</Label>
                            <p>{paymentInfo?.total_price.toLocaleString()} VND</p>
                        </div>
                        <div>
                            <Label>Nội dung:</Label>
                            <p>{paymentInfo?.message.replaceAll("-", "")}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <Label className="mb-2">Mã QR:</Label>
                        <img
                            src={paymentInfo?.qr_url}
                            alt="QR Code"
                            className="w-[252px] h-[252px] border rounded"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleConfirm}>Xác nhận</Button>
                </DialogFooter>
                {isSubmitting && (
                    <div className="absolute inset-0 bg-gray-800 opacity-50 flex flex-col justify-center items-center space-y-4">
                        <div className="spinner-border animate-spin border-4 border-t-4 border-white rounded-full w-12 h-12"></div>
                        <p className="text-white text-lg">Đang xử lý...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;