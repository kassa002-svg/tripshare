import type { Db } from "mongodb";
import { setDBForTests } from "./db";

type Document = Record<string, any>;

const pathValue = (object: Document, path: string): any => path.split(".").reduce((value, key) => value?.[key], object);

function matches(document: Document, filter: Document): boolean {
  return Object.entries(filter).every(([path, expected]) => {
    const actual = pathValue(document, path);
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if ("$in" in expected) return expected.$in.includes(actual);
      if ("$geoWithin" in expected) {
        const ring = expected.$geoWithin.$geometry.coordinates[0] as number[][];
        return Array.isArray(document.items) && document.items.some((item: Document) => {
          const [x, y] = item.location?.coordinates ?? [];
          const xs = ring.map((point) => point[0]!) as number[];
          const ys = ring.map((point) => point[1]!) as number[];
          return x !== undefined && y !== undefined && x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys);
        });
      }
    }
    return actual === expected;
  });
}

function project(document: Document, projection?: Document): Document {
  if (!projection) return structuredClone(document);
  const included = Object.entries(projection).filter(([, value]) => value === 1).map(([key]) => key);
  const excluded = Object.entries(projection).filter(([, value]) => value === 0).map(([key]) => key);
  if (included.length) {
    const result: Document = {};
    for (const key of included) {
      const value = pathValue(document, key);
      if (value !== undefined) result[key] = structuredClone(value);
    }
    return result;
  }
  const result = structuredClone(document);
  for (const key of excluded) delete result[key];
  return result;
}

/** Small Mongo-shaped in-memory database for exercising db.ts query functions. */
export class InMemoryDatabase {
  private readonly collections = new Map<string, Document[]>();
  readonly database: Db;

  constructor(seed: Record<string, Document[]> = {}) {
    for (const [name, documents] of Object.entries(seed)) this.collections.set(name, structuredClone(documents));
    this.database = {
      collection: (name: string) => this.collection(name),
      command: async () => ({ ok: 1 }),
      databaseName: "in-memory",
    } as unknown as Db;
  }

  collection(name: string): any {
    const docs = this.collections.get(name) ?? [];
    this.collections.set(name, docs);
    return {
      findOne: async (filter: Document, options?: Document) => {
        const found = docs.find((doc) => matches(doc, filter));
        return found ? project(found, options?.projection) : null;
      },
      find: (filter: Document, options?: Document) => {
        let results = docs.filter((doc) => matches(doc, filter)).map((doc) => project(doc, options?.projection));
        const cursor = {
          sort: (spec: Document) => { results = results.sort((a, b) => { for (const [key, direction] of Object.entries(spec)) { const av = pathValue(a, key); const bv = pathValue(b, key); if (av !== bv) return (av < bv ? -1 : 1) * Number(direction); } return 0; }); return cursor; },
          limit: (count: number) => { results = results.slice(0, count); return cursor; },
          toArray: async () => structuredClone(results),
        };
        return cursor;
      },
      insertOne: async (document: Document) => { docs.push(structuredClone(document)); return { acknowledged: true, insertedId: document._id }; },
      replaceOne: async (filter: Document, replacement: Document) => { const index = docs.findIndex((doc) => matches(doc, filter)); if (index < 0) return { matchedCount: 0 }; docs[index] = structuredClone(replacement); return { matchedCount: 1 }; },
      deleteOne: async (filter: Document) => { const index = docs.findIndex((doc) => matches(doc, filter)); if (index < 0) return { deletedCount: 0 }; docs.splice(index, 1); return { deletedCount: 1 }; },
      countDocuments: async (filter: Document) => docs.filter((doc) => matches(doc, filter)).length,
      findOneAndUpdate: async (filter: Document, update: Document | Document[], options?: Document) => {
        const document = docs.find((doc) => matches(doc, filter));
        if (!document) return null;
        if (!Array.isArray(update)) Object.assign(document, structuredClone(update.$set ?? {}));
        else {
          for (const stage of update) {
            for (const [key, expression] of Object.entries(stage.$set ?? {}) as [string, any][]) {
              if (key === "likes") {
                const existing: string[] = document.likes ?? [];
                const userId = expression.$cond[0].$in[0];
                document.likes = existing.includes(userId) ? existing.filter((id) => id !== userId) : [...existing, userId];
              } else if (key === "likesCount") document.likesCount = document.likes.length;
              else if (expression === "$$NOW") document[key] = new Date().toISOString();
            }
          }
        }
        return project(document, options?.projection);
      },
      createIndexes: async () => [],
    };
  }

  connect(): void { setDBForTests(this.database); }
  disconnect(): void { setDBForTests(null); }
  documents(name: string): Document[] { return structuredClone(this.collections.get(name) ?? []); }
}
