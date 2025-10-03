"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlotsComponent } from "./SlotsComponent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SlotsPage() {
  const [fieldId, setFieldId] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(inputValue);
    if (!isNaN(id) && id > 0) {
      setFieldId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý khung giờ</h1>
        <p className="text-muted-foreground mt-2">
          Xem, gộp và khóa các khung giờ của sân
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chọn cụm sân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="fieldId">ID Cụm sân</Label>
              <Input
                id="fieldId"
                type="number"
                min="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập ID cụm sân"
              />
            </div>
            <Button type="submit">Xem khung giờ</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Khung giờ của sân</CardTitle>
        </CardHeader>
        <CardContent>
          <SlotsComponent fieldId={fieldId} />
        </CardContent>
      </Card>
    </div>
  );
}
