"use client";
import { useEffect } from "react";

export function useSaveUserLocation() {
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        localStorage.setItem("user_location", JSON.stringify(coords));
        console.log("User location saved:", coords);
      },
      (error) => {
        console.warn("Location access denied or error:", error.message);
      }
    );
  }, []);
}

// Get saved user location from localStorage
export function getLocation(): { lat: number | null; lng: number | null } {
  if (typeof window === "undefined") {
    return { lat: null, lng: null };
  }

  try {
    const saved = localStorage.getItem("user_location");
    if (saved) {
      const coords = JSON.parse(saved);
      return {
        lat: coords.lat || null,
        lng: coords.lng || null,
      };
    }
  } catch (error) {
    console.warn("Failed to parse saved location:", error);
  }

  return { lat: null, lng: null };
}
