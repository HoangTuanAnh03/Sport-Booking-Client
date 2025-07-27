"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import envConfig from "@/config";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { useSideBarStore } from "@/stores/useSideBarStore";

const MapComponent = () => {
  const center1: [number, number] = [105.8423624, 20.9991199];
  const defaultCenter: [number, number] = [105.8423624, 20.9991199];
  const [center, setCenter] = useState<[number, number]>([
    105.8423624, 20.9991199,
  ]);
  const y: [number, number] = [105.8423624, 20.9991199];
  const zoom = 15;
  const initialZoom = 13;
  const mapKey = envConfig.NEXT_PUBLIC_MAP_KEY;
  const mapUrl = envConfig.NEXT_PUBLIC_MAP_URL;
  const route = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const coordinateVenues = useMapStore((state) => state.coordinateVenues);
  const sidebarOpen = useSideBarStore((state) => state.sidebarOpen);
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);
  const [perVenueIdSelected, setPerVenueIdSelected] = useState<string | null>();

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const venueIdSelectedRef = useRef<string | null>(venueIdSelected);
  const typeSportIdRef = useRef<SportTypeEnum | null>(null);

  // get current position
  useEffect(() => {
    // Thử lấy vị trí người dùng
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter([lng, lat]);
        setTimeout(() => {
          mapRef.current?.flyTo({
            center: { lng: lng, lat: lat },
            zoom,
          });
        }, 100);
      });
    } else {
      // setCenter(defaultCenter);
    }
  }, []);

  // handler reverse marker when change venue id selected
  useEffect(() => {
    const venueSelected = coordinateVenues?.find(
      (coord) => coord.id === perVenueIdSelected
    );
    if (venueIdSelectedRef.current) {
      const container = document.getElementById(venueIdSelectedRef.current);
      container
        ?.querySelector("div")
        ?.style.setProperty(
          "background-image",
          `url('/marker/marker_${typeSportIdRef.current}.png')`
        );
    }
    venueIdSelectedRef.current = venueSelected?.id ?? null;
    typeSportIdRef.current = venueSelected?.type ?? null;
  }, [perVenueIdSelected]);

  // handler venue id selected change marker and fly to venue
  useEffect(() => {
    setPerVenueIdSelected(venueIdSelected);
    console.log("🚀 ~ useEffect ~ venueIdSelected:", venueIdSelected);

    if (venueIdSelected !== null && coordinateVenues) {
      const venueSelected = coordinateVenues.find(
        (coord) => coord.id === venueIdSelected
      );
      const container = document.getElementById(venueIdSelected);
      container
        ?.querySelector("div")
        ?.style.setProperty("background-image", `url('/marker/local-red.png')`);
      setTimeout(() => {
        mapRef.current?.flyTo({
          center: { lat: venueSelected!.lat, lng: venueSelected!.lng },
          zoom,
        });
      }, 500);
    }
  }, [venueIdSelected]);

  // remove all default markers, add new markers
  useEffect(() => {
    console.log("🚀 ~ useEffect ~ coordinateVenues:", coordinateVenues);
    if (coordinateVenues !== null) {
      setIsLoading(true);

      // Remove all existing markers
      const markers = document.querySelectorAll(".maplibregl-marker");
      markers.forEach((marker) => marker.remove());

      if (mapRef.current) {
        addMarkers(coordinateVenues ?? [], mapRef.current);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // setCenter([lng, lat]);
          const el = document.createElement("div");
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "9999px";
          el.style.backgroundColor = "#3B82F6"; // màu xanh (Tailwind: blue-500)
          el.style.border = "2px solid white";
          el.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)";

          new maplibregl.Marker({ element: el })
            .setLngLat(center)
            .addTo(mapRef.current!);
        });
      }
    }
  }, [coordinateVenues]);

  const createButtonControl = (
    textContent: string,
    handleClick: () => void
  ): maplibregl.IControl => {
    const customButton = document.createElement("button");
    Object.assign(customButton.style, {
      backgroundColor: "#3498ff",
      color: "white",
      padding: "10px",
      borderRadius: "100%",
      cursor: "pointer",
      width: "50px",
      height: "50px",
      fontSize: "24px",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });
    customButton.textContent = textContent;
    customButton.addEventListener("click", handleClick);

    return {
      onAdd: () => {
        const container = document.createElement("div");
        container.className = "maplibregl-ctrl";
        container.appendChild(customButton);
        return container;
      },
      onRemove: () => {
        customButton.parentNode?.removeChild(customButton);
      },
    } as maplibregl.IControl;
  };

  const createCustomMarker = (
    coord: CoordinateVenue,
    map: maplibregl.Map
  ): HTMLDivElement => {
    const container = document.createElement("div");
    container.id = coord.id;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const el = document.createElement("div");
    Object.assign(el.style, {
      backgroundImage: `url('/marker/marker_${coord.type}.png')`,
      width: "40px",
      height: "40px",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      cursor: "pointer",
    });

    const label = document.createElement("span");
    Object.assign(label.style, {
      width: "120px",
      marginTop: "5px",
      fontSize: "12px",
      lineHeight: "1.2",
      textAlign: "center",
      display: "none",
      cursor: "pointer",
      color: "#3498ff",
      textShadow: `
        0 0 4px white,
        -2px -2px 0 white,
         2px -2px 0 white,
        -2px  2px 0 white,
         2px  2px 0 white,
        -3px 0 0 white,
         3px 0 0 white,
         0 -3px 0 white,
         0  3px 0 white
      `,
    });
    label.textContent = coord.name;

    map.on("zoom", () => {
      label.style.display = map.getZoom() >= zoom - 1 ? "block" : "none";
    });

    const handleClick = () => {
      if (venueIdSelectedRef.current) {
        const container = document.getElementById(venueIdSelectedRef.current);
        container
          ?.querySelector("div")
          ?.style.setProperty(
            "background-image",
            `url('/marker/marker_${typeSportIdRef.current}.png')`
          );
      }
      route.push(`/maps?id=${coord.id}`);
      setPerVenueIdSelected(coord.id);
      el.style.backgroundImage = `url('/marker/local-red.png')`;
      setTimeout(() => {
        map.flyTo({ center: { lat: coord.lat, lng: coord.lng }, zoom });
      }, 500);
    };

    el.addEventListener("click", handleClick);
    label.addEventListener("click", handleClick);

    container.appendChild(label);
    container.appendChild(el);
    return container;
  };

  const addMarkers = (coords: CoordinateVenue[], map: maplibregl.Map): void => {
    coords.forEach((coord) => {
      new maplibregl.Marker({
        element: createCustomMarker(coord, map),
      })
        .setLngLat([coord.lng, coord.lat])
        .addTo(map);
    });
  };

  // init map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const currentCenter = coordinateVenues?.find(
        (coord) => coord.id === venueIdSelected
      );
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `${mapUrl}/goong_map_web.json?api_key=${mapKey}`,
        center: currentCenter ? [currentCenter.lng, currentCenter.lat] : center,
        zoom: initialZoom,
      });

      mapRef.current.on("styledata", () => {
        const layers = mapRef.current!.getStyle().layers;
        if (layers) {
          const filteredLayers = layers.filter(
            (layer) => !layer.id.includes("poi")
          );
          const style = mapRef.current!.getStyle();
          style.layers = filteredLayers;
          mapRef.current!.setStyle(style);
        }
      });

      mapRef.current.on("load", () => {
        addMarkers(coordinateVenues ?? [], mapRef.current!);
        if (venueIdSelected) {
          const container = document.getElementById(venueIdSelected);
          container
            ?.querySelector("div")
            ?.style.setProperty(
              "background-image",
              `url('/marker/local-red.png')`
            );
          setPerVenueIdSelected(venueIdSelected);
        }
      });

      mapRef.current.addControl(
        createButtonControl("-", () => mapRef.current!.zoomOut()),
        "bottom-right"
      );

      mapRef.current.addControl(
        createButtonControl("+", () => mapRef.current!.zoomIn()),
        "bottom-right"
      );
      mapRef.current.addControl(
        createButtonControl("📍", () => {
          mapRef.current?.flyTo({
            center: center,
            zoom,
          });
        }),
        "bottom-right"
      );
    }
  }, [y, zoom, mapKey, mapUrl]);

  return (
    <div
      className={cn(
        "h-full w-full bg-gray-100",
        sidebarOpen && "w-[calc(100%-600px)] right-0 absolute"
      )}
    >
      {isLoading && (
        <div ref={mapContainerRef} className="relative h-full w-full"></div>
      )}
    </div>
  );
};

export default MapComponent;
