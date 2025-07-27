"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface BookingInfoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (info: { name: string; phone: string }) => void;
}

export const BookingInfoModal = ({
  open,
  onClose,
  onConfirm,
}: BookingInfoModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const checkName = (value: string) => {
    if (!value.trim()) {
      setNameError("Vui lòng nhập họ và tên.");
    } else {
      setNameError("");
    }
  };

  const checkPhone = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setPhoneError("Vui lòng nhập số điện thoại.");
    } else if (!/^\d+$/.test(trimmed)) {
      setPhoneError("Số điện thoại chỉ được chứa chữ số.");
    } else if (!/^0\d{9,10}$/.test(trimmed)) {
      setPhoneError(
        "Số điện thoại phải bắt đầu bằng số 0 và có độ dài hợp lệ."
      );
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Vui lòng nhập họ và tên.");
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại.");
      valid = false;
    }

    if (!valid) return;

    onConfirm({ name, phone });
    setName("");
    setPhone("");
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập thông tin người đặt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Họ và tên"
            value={name}
            required={true}
            onChange={(e) => {
              setName(e.target.value);
              checkName(e.target.value);
            }}
          />
          <Input
            placeholder="Số điện thoại"
            value={phone}
            required={true}
            onChange={(e) => {
              setPhone(e.target.value);
              checkPhone(e.target.value);
            }}
          />
          <p
            className={`text-xs mt-2 min-h-[16px] ${
              nameError || phoneError ? "text-red-500" : "text-transparent"
            }`}
          >
            {nameError ? nameError : phoneError ? phoneError : ""}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
      <style jsx global>{`
        div[data-state="open"] {
          z-index: 9000 !important;
        }
      `}</style>
    </Dialog>
  );
};
