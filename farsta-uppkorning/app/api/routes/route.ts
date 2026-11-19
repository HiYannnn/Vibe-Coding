import { database } from "../../../lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Point = { lat: number; lng: number; time?: string };
type RouteRow = {
  id: string;
  name: string;
  skills: string;
  distance_km: number;
  duration_minutes: number;
  points: Point[];
  created_at: Date;
};

function distance(a: Point, b: Point): number {
  const radians = Math.PI / 180;
  const value = Math.sin((b.lat - a.lat) * radians / 2) ** 2
    + Math.cos(a.lat * radians) * Math.cos(b.lat * radians)
    * Math.sin((b.lng - a.lng) * radians / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(value));
}

export async function GET() {
  try {
    const result = await database().query<RouteRow>(
      `SELECT id, name, skills, distance_km, duration_minutes, points, created_at
       FROM public.routes ORDER BY created_at DESC, id DESC LIMIT 50`
    );
    const routes = result.rows.map(row => ({
      id: Number(row.id),
      name: row.name,
      skills: row.skills,
      distanceKm: row.distance_km,
      durationMinutes: row.duration_minutes,
      points: row.points,
      createdAt: row.created_at.toISOString()
    }));
    return Response.json({ routes }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return Response.json({ error: "Route library unavailable" }, { status: 503 });
  }
}

function isPoint(value: unknown): value is Point {
  if (value === null || typeof value !== "object") return false;
  const point = value as Partial<Point>;
  return typeof point.lat === "number" && typeof point.lng === "number"
    && Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat >= 55 && point.lat <= 70
    && point.lng >= 10 && point.lng <= 25;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid route information" }, { status: 400 });
  }

  if (payload === null || typeof payload !== "object") {
    return Response.json({ error: "Invalid route information" }, { status: 400 });
  }
  const input = payload as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const skills = input.skills === undefined ? ""
    : typeof input.skills === "string" ? input.skills.trim() : null;
  const points = input.points;
  if (!name || name.length > 60 || skills === null || skills.length > 250
    || !Array.isArray(points) || points.length < 2 || points.length > 5000
    || (input.durationMinutes !== undefined
      && (typeof input.durationMinutes !== "number" || !Number.isFinite(input.durationMinutes)))) {
    return Response.json({ error: "Invalid route information" }, { status: 400 });
  }
  if (!points.every(isPoint)) {
    return Response.json({ error: "Route must be in Sweden" }, { status: 400 });
  }

  const distanceKm = points.slice(1).reduce(
    (sum, point, index) => sum + distance(points[index], point), 0
  );
  if (distanceKm < 0.05 || distanceKm > 150) {
    return Response.json({ error: "Route distance is outside the allowed range" }, { status: 400 });
  }
  const reduced = points.length > 1200
    ? Array.from({ length: 1200 }, (_, index) => points[Math.round(index * (points.length - 1) / 1199)])
    : points;
  const durationMinutes = Math.max(0, Math.min(300, Math.round((input.durationMinutes as number) || 0)));

  try {
    const result = await database().query<{ id: string }>(
      `INSERT INTO public.routes
        (name, skills, distance_km, duration_minutes, points)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id`,
      [name, skills, distanceKm, durationMinutes, JSON.stringify(reduced)]
    );
    return Response.json({ route: { id: Number(result.rows[0].id) } }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not publish this route" }, { status: 503 });
  }
}
