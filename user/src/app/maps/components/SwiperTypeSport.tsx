"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMapStore } from "@/stores/useMapStore";

export default function SwipeableFieldTypes() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Trạng thái cho tính năng kéo
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { fieldTypes, typeSportIdFilter, setTypeSportIdFilter } = useMapStore();

  // Kiểm tra xem có cần hiển thị các nút điều hướng không
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // Thêm một chút dung sai
  };

  // Thiết lập sự kiện scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      // Kiểm tra ban đầu
      checkScrollPosition();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  // Xử lý cuộn sang trái
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200;
    }
  };

  // Xử lý cuộn sang phải
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200;
    }
  };

  // Xử lý khi bắt đầu kéo
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);

    // Thay đổi con trỏ
    document.body.style.cursor = "grabbing";
  };

  // Xử lý khi kéo
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Nhân 2 để tăng tốc độ cuộn
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Xử lý khi kết thúc kéo
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
  };

  // Xử lý khi con trỏ rời khỏi vùng
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = "default";
    }
  };

  // Xử lý sự kiện cảm ứng
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.touches[0].clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const x = e.touches[0].clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Nhân 2 để tăng tốc độ cuộn
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Nút cuộn sang trái */}
      {showLeftArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-400 shadow-md rounded-full h-8 w-8 border"
          onClick={handleScrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Cuộn sang trái</span>
        </Button>
      )}

      {/* Danh sách loại sân có thể vuốt */}
      <div
        className={cn(
          "flex overflow-x-auto no-scrollbar  mx-4 gap-2 w-[calc(100%-32px)] h-full relative",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        ref={scrollContainerRef}
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {fieldTypes.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            className={cn(
              "flex h-full items-center gap-2 whitespace-nowrap px-4 pl-6 pr-8 py-2 rounded-full border shadow-sm select-none",
              typeSportIdFilter === type.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white hover:bg-gray-50"
            )}
            onClick={(e) => {
              !isDragging &&
                setTypeSportIdFilter(
                  typeSportIdFilter === type.id ? null : type.id
                );
            }}
          >
            <Image
              width={30}
              height={30}
              src={`/marker/marker_${type.type}.png`}
              alt={`${type.name} marker`}
              className="pointer-events-none"
            />
            <span className="flex-shrink-0">{type.name}</span>
          </Button>
        ))}
      </div>

      {/* Nút cuộn sang phải */}
      {showRightArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-400 shadow-md rounded-full h-8 w-8 border"
          onClick={handleScrollRight}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Cuộn sang phải</span>
        </Button>
      )}
    </div>
  );
}
