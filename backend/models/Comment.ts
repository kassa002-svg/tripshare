export interface Comment {
  id: string;

  itineraryId: string;
  itemId: string | null; // null = comment on the itinerary, set = comment on specific item
  authorId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}
