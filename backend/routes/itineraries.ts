import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
const router = Router();

import { authenticate } from "../middleware/authenticate";
import { toGeoPoint } from "../models/geo";
import type {
  CreateItineraryBody,
  Itinerary,
  ItineraryItem,
} from "../models/Itinerary";
import type { Comment } from "../models/Comment";
import type { User } from "../models/User";

router.get("/:id/comments/count", async (req: Request, res: Response) => {
  const itineraryId = String(req.params.id);
  const itinerary = await getDB().collection<Itinerary>("itineraries")
    .findOne({ id: itineraryId }, { projection: { _id: 0, id: 1 } });
  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }
  const count = await getDB().collection<Comment>("comments").countDocuments({ itineraryId });
  res.json({ count });
});

router.get("/:id/comments", async (req: Request, res: Response) => {
  const itineraryId = String(req.params.id);
  const itinerary = await getDB().collection<Itinerary>("itineraries").findOne({ id: itineraryId }, { projection: { _id: 0, id: 1 } });
  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  const comments = await getDB().collection<Comment>("comments")
    .find({ itineraryId }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray();
  const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
  const authors = await getDB().collection<User>("users")
    .find({ id: { $in: authorIds } }, { projection: { _id: 0, id: 1, displayName: 1 } })
    .toArray();
  const usernamesById = new Map(authors.map((author) => [author.id, author.displayName]));

  res.json(comments.map((comment) => ({
    ...comment,
    username: comment.username || usernamesById.get(comment.authorId) || "Former traveler",
  })));
});

router.post("/:id/comments", authenticate, async (req: Request, res: Response) => {
  const itineraryId = String(req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const itemId = req.body?.itemId == null ? null : req.body.itemId;
  if (!text || text.length > 2000) {
    res.status(400).json({ error: "Comment must be between 1 and 2000 characters" });
    return;
  }
  if (itemId !== null && typeof itemId !== "string") {
    res.status(400).json({ error: "Invalid itinerary stop" });
    return;
  }

  const itinerary = await getDB().collection<Itinerary>("itineraries").findOne({ id: itineraryId });
  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }
  if (itemId && !itinerary.items.some((item) => item.id === itemId)) {
    res.status(400).json({ error: "Stop does not belong to this itinerary" });
    return;
  }

  const now = new Date().toISOString();
  const comment: Comment = {
    id: new ObjectId().toHexString(), itineraryId, itemId,
    authorId: req.session.userId!, username: "", text, createdAt: now, updatedAt: now,
  };
  const author = await getDB().collection<User>("users").findOne(
    { id: comment.authorId }, { projection: { _id: 0, displayName: 1 } },
  );
  comment.username = author?.displayName || "Traveler";
  await getDB().collection<Comment>("comments").insertOne(comment);
  res.status(201).json(comment);
});

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

router.get("/", async (req: Request, res: Response) => {
  const authorId = typeof req.query.authorId === "string" ? req.query.authorId : undefined;
  const itineraryQuery = authorId ? { authorId } : {};
  const itineraries = await getDB()
    .collection<Itinerary>("itineraries")
    .find(itineraryQuery)
    .toArray();

  res.json(itineraries);
});

router.get("/nearby", async (req: Request, res: Response) => {
  const north = Number(req.query.north);
  const south = Number(req.query.south);
  const east = Number(req.query.east);
  const west = Number(req.query.west);

  const visibleArea = {
    type: "Polygon",
    coordinates: [[
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ]],
  };

  const itineraries = await getDB().collection<Itinerary>("itineraries").find(
      { "items.location": { $geoWithin: { $geometry: visibleArea } } },
      { projection: { _id: 0 } },
    )
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  res.json(itineraries);
});

router.get("/owned", authenticate, async (req: Request, res: Response) => {
  const itineraries = await getDB().collection<Itinerary>("itineraries").find(
    { authorId: req.session.userId! }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
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


router.patch("/:id/likes", authenticate, async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const itinerary = await getDB()
    .collection<Itinerary>("itineraries")
    .findOneAndUpdate(
      { id: req.params.id },
      [
        {
          $set: {
            likes: {
              $cond: [
                { $in: [userId, { $ifNull: ["$likes", []] }] },
                {
                  $setDifference: [
                    { $ifNull: ["$likes", []] },
                    [userId],
                  ],
                },
                { $setUnion: [{ $ifNull: ["$likes", []] }, [userId]] },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
        },
        { $set: { likesCount: { $size: "$likes" } } },
      ],
      { projection: { _id: 0 }, returnDocument: "after" },
    );

  if (!itinerary) {
    res.status(404).json({ error: "Itinerary does not exist" });
    return;
  }

  res.json({
    liked: itinerary.likes.includes(userId),
    likes: itinerary.likes,
    likesCount: itinerary.likesCount,
  });
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
    (item: Partial<ItineraryItem>, index: number) => {
      const oldItem =
        old.items.find((existingItem) => existingItem.id === item.id) ??
        old.items[index];

      return {
        id: item.id ?? new ObjectId().toHexString(),
        itineraryId: req.params.id,
        name: item.name ?? oldItem?.name ?? "",
        description: item.description ?? oldItem?.description ?? "",
        photoUrl: item.photoUrl ?? oldItem?.photoUrl ?? "",
        placeId: item.placeId ?? oldItem?.placeId ?? "",
        address: item.address ?? oldItem?.address ?? "",
        location: item.location ??
          oldItem?.location ?? {
            type: "Point",
            coordinates: [0, 0],
          },
        category: item.category ?? oldItem?.category ?? null,
        order: item.order ?? oldItem?.order ?? index,
        createdAt: item.createdAt ?? oldItem?.createdAt ?? now,
        updatedAt: now,
      };
    },
  );

  const updatedItinerary: Itinerary = {
    ...existing,
    authorId: req.body.authorId ?? old.authorId,
    title: req.body.title ?? old.title,
    description: req.body.description ?? old.description,
    items,
    likes: old.likes,
    likesCount: old.likesCount,
    copiedFrom: req.body.copiedFrom ?? old.copiedFrom,
    updatedAt: now,
  };

  await getDB()
    .collection<Itinerary>("itineraries")
    .replaceOne({ id: req.params.id }, updatedItinerary);

  res.json(updatedItinerary);
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
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
