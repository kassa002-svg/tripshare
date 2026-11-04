import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import type { Itinerary, ItineraryItem } from "../models/Itinerary";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const id = new ObjectId().toHexString();
  const now = new Date().toISOString();
  const items: ItineraryItem[] = (req.body.items ?? []).map(
    (item: Partial<ItineraryItem>, index: number) => ({
      id: new ObjectId().toHexString(),
      itineraryId: id,
      name: item.name,
      description: item.description ?? "",
      photoUrl: item.photoUrl ?? "",
      placeId: item.placeId,
      order: item.order ?? index,
      createdAt: now,
      updatedAt: now,
    }),
  );

  const itinerary: Itinerary = {
    id,
    authorId: req.body.authorId,
    title: req.body.title,
    description: req.body.description ?? "",
    items,
    likes: [],
    likesCount: 0,
    copiedFrom: req.body.copiedFrom ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await getDB().collection<Itinerary>("itineraries").insertOne(itinerary);
  res.status(201).json(itinerary);
});

router.get("/", async (_req: Request, res: Response) => {
  const itineraries = await getDB()
    .collection<Itinerary>("itineraries")
    .find({})
    .toArray();

  res.json(itineraries);
});

router.get("/:id", async (req: Request, res: Response) => {
  const itinerary = await getDB()
    .collection<Itinerary>("itineraries")
    .findOne({ id: req.params.id });

  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  res.json(itinerary);
});

router.patch("/:id", async (req: Request, res: Response) => {
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
