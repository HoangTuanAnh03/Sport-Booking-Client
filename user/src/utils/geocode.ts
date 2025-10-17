import envConfig from "@/config";
interface GoongGeocodeResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
}

function convertLatLng([lat, lng]: [number, number]): [number, number] {
  if (lat < -90 || lat > 90) {
    return [lng, lat];
  }
  return [lat, lng];
}
