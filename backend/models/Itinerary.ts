import type { GeoPoint, LatLng } from "./geo";

export interface ItineraryItem {
  id: string;

  itineraryId: string;
  name: string;
  description: string;
  photoUrl: string; // Cloudinary URL
  placeId: string; // Google Places id
  address: string;
  location: GeoPoint;
  category: string | null;
  order: number; // position in itinerary
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: string;

  authorId: string;
  title: string;
  description: string;
  items: ItineraryItem[]; // embedded
  likes: string[]; // array of user ids
  likesCount: number; // for sorting by likes
  copiedFrom: string | null; // itinerary id
  createdAt: string;
  updatedAt: string;
}

export type NewItineraryItem = Pick<ItineraryItem, "placeId" | "name" | "address" | "category" | "description"> & { 
  location: LatLng;
}

export interface CreateItineraryBody {
  title: string;
  description: string;
  items: NewItineraryItem[];
}