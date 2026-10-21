export interface User {
  id: string;

  passwordHash: string | null;
  googleId: string | null;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  following: string[]; // array of ids
  savedItineraries: string[]; // array of ids
  createdAt: string;
}

export interface ItineraryItem {
  id: string;

  itineraryId: string;
  name: string;
  description: string;
  photoUrl: string; // Cloudinary URL
  placeId: string; // Google Places id
  order: number; // position in itinerary
  createdAt: string;
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

export interface Comment {
  id: string;

  itineraryId: string;
  itemId: string | null; // null = comment on the itinerary, set = comment on specific item
  authorId: string;
  text: string;
  createdAt: string;
}
