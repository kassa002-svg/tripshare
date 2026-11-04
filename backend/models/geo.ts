export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export function toGeoPoint({ lat, lng }: LatLng): GeoPoint {
  return { type: "Point", coordinates: [lng, lat] };
}

export function toLatLng(point: GeoPoint): LatLng {
  const [lng, lat] = point.coordinates;
  return { lat, lng };
}