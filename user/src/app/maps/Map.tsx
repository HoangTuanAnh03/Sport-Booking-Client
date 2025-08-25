"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import envConfig from "@/config";
import { useRouter } from "next/navigation";
import { cn, getLocation } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { useSideBarStore } from "@/stores/useSideBarStore";
import venueApiRequest from "@/apiRequests/venue";

const MapComponent = () => {
  const [center, setCenter] = useState<Coord>([0, 0]);
  const y: Coord = [0, 0];
  const zoom = 15;
  const initialZoom = 13;
  const mapKey = envConfig.NEXT_PUBLIC_MAP_KEY;
  const mapUrl = envConfig.NEXT_PUBLIC_MAP_URL;
  const route = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const coordinateVenues = useMapStore((state) => state.coordinateVenues);
  const sidebarOpen = useSideBarStore((state) => state.sidebarOpen);
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);
  const directionMode = useSideBarStore((state) => state.directionMode);
  const setDirectionMode = useSideBarStore((state) => state.setDirectionMode);
  const [perVenueIdSelected, setPerVenueIdSelected] = useState<number | null>();

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const venueIdSelectedRef = useRef<number | null>(venueIdSelected);
  const typeSportIdRef = useRef<SportTypeEnum | null>(null);

  useEffect(() => {
    const { lat, lng } = getLocation();
    if (lat && lng) {
      setCenter([lng, lat]);
    }
  }, []);

  useEffect(() => {
    if (venueIdSelected && directionMode) {
      const venueSelected = coordinateVenues?.find(
        (coord) => coord.id === venueIdSelected
      );
      if (venueSelected && center[0] !== 0 && center[1] != 0) {
        fetchDirections(center, [venueSelected.lng, venueSelected.lat]);
      }
    } else if (mapRef.current?.getSource("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }
  }, [directionMode]);

  // handler reverse marker when change venue id selected
  useEffect(() => {
    const venueSelected = coordinateVenues?.find(
      (coord) => coord.id === perVenueIdSelected
    );
    if (venueIdSelectedRef.current) {
      const container = document.getElementById(
        venueIdSelectedRef.current.toString()
      );
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
    setDirectionMode(false);
    removePopup();
    if (venueIdSelected !== null && coordinateVenues) {
      const venueSelected = coordinateVenues.find(
        (coord) => coord.id == venueIdSelected
      );
      const container = document.getElementById(venueIdSelected.toString());
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
    if (coordinateVenues !== null) {
      setIsLoading(true);

      // Remove all existing markers
      const markers = document.querySelectorAll(".maplibregl-marker");
      markers.forEach((marker) => marker.remove());

      if (mapRef.current) {
        addMarkers(coordinateVenues ?? [], mapRef.current);
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
      }
    }
  }, [coordinateVenues]);

  const createButtonControl = (
    textContent: string,
    handleClick: () => void
  ): maplibregl.IControl => {
    const customButton = document.createElement("button");
    Object.assign(customButton.style, {
      backgroundColor: "#ffffff",
      color: "#374151",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      width: "48px",
      height: "48px",
      fontSize: "18px",
      fontWeight: "600",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "1px solid #e5e7eb",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: "all 0.2s ease-in-out",
      outline: "none",
    });

    // Add hover effects
    customButton.addEventListener("mouseenter", () => {
      Object.assign(customButton.style, {
        backgroundColor: "#f9fafb",
        transform: "translateY(-1px)",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      });
    });

    customButton.addEventListener("mouseleave", () => {
      Object.assign(customButton.style, {
        backgroundColor: "#ffffff",
        transform: "translateY(0)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      });
    });

    customButton.addEventListener("mousedown", () => {
      customButton.style.transform = "translateY(0) scale(0.95)";
    });

    customButton.addEventListener("mouseup", () => {
      customButton.style.transform = "translateY(-1px) scale(1)";
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
    container.id = coord.id.toString();
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
        const container = document.getElementById(
          venueIdSelectedRef.current.toString()
        );
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

  const fetchDirections = async (startCoords: Coord, endCoords: Coord) => {
    try {
      const result = await venueApiRequest.sGetDirection(
        [endCoords[1], endCoords[0]],
        [startCoords[1], startCoords[0]]
      );

      const data = result.payload.data;
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].overview_polyline.points;
        const distance = data.routes[0].legs[0].distance.text;
        const time = data.routes[0].legs[0].duration.text;
        const decodedRoute = decodePolyline(route);
        displayRoute(
          decodedRoute,
          startCoords,
          endCoords,
          distance,
          time,
          mapRef.current!
        );
      } else {
        alert("Không tìm thấy tuyến đường.");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      alert("Lỗi khi tìm đường.");
    }
  };

  const decodePolyline = (encoded: any) => {
    var points = [];
    var index = 0,
      len = encoded.length;
    var lat = 0,
      lng = 0;

    while (index < len) {
      var b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lng * 1e-5, lat * 1e-5]);
    }

    return points;
  };

  const displayRoute = (
    route: any,
    startCoords: Coord,
    endCoords: Coord,
    distance: any,
    time: any,
    map: maplibregl.Map
  ) => {
    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }
    const start = [startCoords[1], startCoords[0]];
    const end = [endCoords[1], endCoords[0]];
    const longLatStart: Coord = [start[1], start[0]];
    const longLatEnd: Coord = [end[1], end[0]];
    //add marker to start and end location
    // new maplibregl.Marker().setLngLat(longLatStart).addTo(map);
    // new maplibregl.Marker().setLngLat(longLatEnd).addTo(map);
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      },
    });
    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#00ff05",
        "line-width": 5,
        "line-opacity": 0.9,
      },
    });
    // Find the midpoint of the route to show popup
    const midPoint = route[Math.floor(route.length / 2)];
    //Add a marker for the midpoint with distance + time information
    new maplibregl.Popup({
      closeButton: false, // mặc định là true
      closeOnClick: false, // nếu muốn không tắt khi click bản đồ
      className: "custom-popup", // thêm class để tùy chỉnh CSS
    })
      .setLngLat(midPoint)
      .setHTML(
        `
      <div class="popup-content">
        <div class="popup-row">
          <strong>📏 Khoảng cách: </strong>
          <div class="popup-value distance">${distance}</div>
        </div>
        <div class="popup-row">
          <strong>⏱️ Thời gian: </strong>
          <div class="popup-value time">${time}</div>
        </div>
      </div>
    `
      )
      .addTo(map);

    map.fitBounds(
      route.reduce(function (bounds: any, coord: any) {
        return bounds.extend(coord);
      }, new maplibregl.LngLatBounds(route[0], route[0]))
    );
  };

  const removePopup = () => {
    const popups = document.querySelectorAll(".maplibregl-popup");
    popups.forEach((popup) => popup.remove());
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
        if (venueIdSelected) {
          const container = document.getElementById(venueIdSelected.toString());
          container
            ?.querySelector("div")
            ?.style.setProperty(
              "background-image",
              `url('/marker/local-red.png')`
            );
          setPerVenueIdSelected(venueIdSelected);
        }
      });

      mapRef.current.on("remove", () => {
        if (mapRef.current?.getSource("route")) {
          mapRef.current.removeLayer("route");
          mapRef.current.removeSource("route");
        }
        setDirectionMode(false);
        removePopup();
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
