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

export async function getLatLngByName(address: string): Promise<[number, number]> {
    const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${envConfig.NEXT_PUBLIC_MAP_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GoongGeocodeResponse = await response.json();
        const firstLocation = data.results?.[0]?.geometry?.location;
        if (!firstLocation) {
            throw new Error('Not found');
        }
        const { lat, lng } = firstLocation;
        return convertLatLng([lat, lng]);
    } catch (error) {
        console.error('Error :', error);
        throw error;
    }
}

function convertLatLng([lat, lng]: [number, number]): [number, number] {
    if (lat < -90 || lat > 90) {
        return [lng, lat];
    }
    return [lat, lng];
}