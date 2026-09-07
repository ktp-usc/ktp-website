import { requireExec } from "@/lib/auth/guards";
import { badRequest, ok, serverError } from "@/lib/http/responses";
import {
  getCurrentSemester,
  parseSemesterInput,
  setCurrentSemester,
} from "@/lib/semester";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const authed = await requireExec();
  if ("response" in authed) return authed.response;

  try {
    const semester = await getCurrentSemester();
    return ok({ semester });
  } catch (error) {
    console.error("GET /api/semester error:", error);
    return serverError();
  }
}

export async function PUT(req: Request) {
  const authed = await requireExec();
  if ("response" in authed) return authed.response;

  try {
    const body = await req.json();
    const semester = parseSemesterInput(body.semester);
    if (!semester) return badRequest("invalid_semester");

    const updated = await setCurrentSemester(semester);
    return ok({ semester: updated.semester });
  } catch (error) {
    console.error("PUT /api/semester error:", error);
    return serverError();
  }
}
