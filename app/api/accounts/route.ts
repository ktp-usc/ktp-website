import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok, serverError } from "@/lib/http/responses";
import { parseAccountTypesParam } from "@/lib/events";
import type { type as AccountType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseIntParam(v: string | null, fallback: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const type = (searchParams.get("type") ?? "").trim();
    const types = parseAccountTypesParam(searchParams.get("types") ?? "");
    const leaderType = (searchParams.get("leaderType") ?? "").trim();

    const [firstName, ...rest] = q.split(/\s+/);
    const lastName = rest.join(" ");

    const take = searchParams.get("take");

    const skipRaw = parseIntParam(searchParams.get("skip"), 0);
    const skip = Math.max(skipRaw, 0);

    const typeFilter: { type?: AccountType | { in: AccountType[] } } =
      types.length > 0 ? { type: { in: types } } : type ? { type: type as AccountType } : {};

    const where: any = {
      ...typeFilter,
      ...(leaderType ? { leaderType } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { schoolEmail: { contains: q, mode: "insensitive" } },
              { personalEmail: { contains: q, mode: "insensitive" } },
              {
                AND: [
                  { firstName: { contains: firstName, mode: "insensitive" } },
                  { lastName: { contains: lastName, mode: "insensitive" } },
                ],
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.accounts.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        ...(take ? { take: parseInt(take) } : {}),
        skip,
      }),
      prisma.accounts.count({ where }),
    ]);

    return ok({ items, total, take, skip });
  } catch (e) {
    console.error("GET /api/accounts error:", e);
    return serverError();
  }
}
