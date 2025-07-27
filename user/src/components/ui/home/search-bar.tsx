"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [sportType, setSportType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct search query
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (sportType) params.append("type", sportType);

    router.push(`/fields?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Tìm kiếm theo địa điểm..."
          className="pl-10"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* <Select value={sportType} onValueChange={setSportType}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Loại bản đồ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="football">Bóng đá</SelectItem>
          <SelectItem value="basketball">Bóng rổ</SelectItem>
          <SelectItem value="tennis">Tennis</SelectItem>
          <SelectItem value="badminton">Cầu lông</SelectItem>
          <SelectItem value="volleyball">Bóng chuyền</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" className="md:w-[120px]">
        Tìm kiếm
      </Button> */}
    </form>
  );
}
