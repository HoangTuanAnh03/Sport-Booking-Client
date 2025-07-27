import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import {Field} from "@/types/field";

const sportTypeMap: { [key: number]: string } = {
    1: "Cầu Lông",
    2: "Bóng Đá",
    3: "Bóng Rổ",
    4: "Bóng Chuyền",
    5: "Tenis",
    6: "Bóng Bàn",
    7: "Pickleball",
};

interface FieldCardProps {
    field: Field;
}

export default function FieldCard({field}: FieldCardProps) {
    return (
        <Card
            key={field.field_id}
            className="w-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-lg shadow-sm"
        >
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">
                    {field.field_name}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <p className="text-gray-700">
                        <strong className="font-medium">Loại thể thao:</strong>{" "}
                        {sportTypeMap[field.sport_type_id] || "Unknown"}
                    </p>
                    <p className="text-gray-700">
                        <strong className="font-medium">Giá trung bình:</strong>{" "}
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(Number(field.default_price))}
                    </p>
                    {/*{field.opening_hour_today ? (*/}
                    {/*    <p className="text-gray-700">*/}
                    {/*        <strong className="font-medium">Giờ mở cửa:</strong>{" "}*/}
                    {/*        {field.opening_hour_today.opening_time.slice(0, 5)} -{" "}*/}
                    {/*        {field.opening_hour_today.closing_time.slice(0, 5)}*/}
                    {/*    </p>*/}
                    {/*) : (*/}
                    {/*    ""*/}
                    {/*)}*/}
                </div>
                <div className="flex items-end justify-end">
                    {field.opening_hour_today ? (
                        <Button
                            asChild
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            <Link href={`/booking?fieldid=${field.field_id}`}>
                                Đặt Ngay
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            disabled
                            className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                        >
                            Sân chưa hoạt động
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}