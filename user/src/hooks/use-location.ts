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
