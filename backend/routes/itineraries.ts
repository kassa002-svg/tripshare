import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
const router = Router();

import { authenticate } from "../middleware/authenticate";
import { toGeoPoint } from "../models/geo";
import type { CreateItineraryBody, Itinerary } from "../models/Itinerary";

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

router.get("/", authenticate, async (_req: Request, res: Response) => {
  const itineraries = await getDB()
    .collection<Itinerary>("itineraries")
    .find({})
    .toArray();

  res.json(itineraries);
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const itinerary = await getDB()
    .collection<Itinerary>("itineraries")
    .findOne({ id: req.params.id });

  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  res.json(itinerary);
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  const old = await getDB()
    .collection<Itinerary>("itineraries")
    .findOne({ id: req.params.id });

  if (!old) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  const now = new Date().toISOString();
  const { _id, ...existing } = old;
  const items: ItineraryItem[] = (req.body.items ?? old.items).map(
    (item: Partial<ItineraryItem>, index: number) => ({
      id: item.id ?? new ObjectId().toHexString(),
      itineraryId: req.params.id,
      name: item.name,
      description: item.description ?? "",
      photoUrl: item.photoUrl ?? "",
      placeId: item.placeId,
      order: item.order ?? index,
      createdAt: item.createdAt ?? now,
      updatedAt: now,
    }),
  );

  const updatedItinerary: Itinerary = {
    ...existing,
    authorId: req.body.authorId ?? old.authorId,
    title: req.body.title ?? old.title,
    description: req.body.description ?? old.description,
    items,
    likes: req.body.likes ?? old.likes,
    likesCount: (req.body.likes ?? old.likes).length,
    copiedFrom: req.body.copiedFrom ?? old.copiedFrom,
    updatedAt: now,
  };

  await getDB()
    .collection<Itinerary>("itineraries")
    .replaceOne({ id: req.params.id }, updatedItinerary);

  res.json(updatedItinerary);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const result = await getDB()
    .collection<Itinerary>("itineraries")
    .deleteOne({ id: req.params.id });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  res.sendStatus(204);
});

export default router;
