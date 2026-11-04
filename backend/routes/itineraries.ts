import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import { authenticate } from "../middleware/authenticate";
import { toGeoPoint } from "../models/geo";
import type { CreateItineraryBody, Itinerary } from "../models/Itinerary";

const router = Router();

router.post("/", authenticate, async (req: Request, res: Response) => {
  const body = req.body as CreateItineraryBody; 

  if (!body.title || !Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: "Add a title and at least one stop" });
    return;
  }

  const now = new Date().toISOString();
  const itineraryId = new ObjectId().toHexString();

  const itinerary: Itinerary = {
    id: itineraryId,
    authorId: req.session.userId!,
    title: body.title,
    description: body.description ?? "",
    items: body.items.map((item, index) => ({
      id: new ObjectId().toHexString(),
      itineraryId,
      name: item.name,
      description: item.description ?? "",
      photoUrl: "",
      placeId: item.placeId,
      address: item.address,
      location: toGeoPoint(item.location),
      category: item.category,
      order: index,
      createdAt: now,
      updatedAt: now,
    })),
    likes: [],
    likesCount: 0,
    copiedFrom: null,
    createdAt: now,
    updatedAt: now,
  };

  await getDB().collection<Itinerary>("itineraries").insertOne(itinerary);
  res.status(201).json({ message: "Itinerary saved", id: itineraryId });
});

export default router;