export interface ItineraryItem {
  id: string;

  itineraryId: string;
  name: string;
  description: string;
  photoUrl: string; // Cloudinary URL
  placeId: string; // Google Places id
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
