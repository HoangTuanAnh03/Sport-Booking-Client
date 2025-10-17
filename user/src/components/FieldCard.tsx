import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { FieldByVenueId } from "@/types/field";

const sportTypeMap: { [key: number]: string } = {
  101: "Cầu Lông",
  102: "Bóng Đá",
  103: "Pickleball",
  104: "Tenis",
  105: "Bóng Chuyền",
  106: "Bóng rổ",
  107: "Golf",
  108: "Bóng bàn",
};

interface FieldCardProps {
  field: FieldByVenueId;
}

export default function FieldCard({ field }: FieldCardProps) {
  return (
    <Card
      key={field.id}
      className="w-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-lg shadow-sm"
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-blue-700">
          {field.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-gray-700">
            <strong className="font-medium">Loại thể thao:</strong>{" "}
            {sportTypeMap[field.sportTypeId] || "Unknown"}
          </p>
        </div>
        <div className="flex items-end justify-end">
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <Link href={`/booking/${field.id}`}>Đặt Ngay</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
