import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok, serverError } from "@/lib/http/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    const authed = await requireUser();
    if ("response" in authed) return authed.response;

    try {
        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
            include: {
                applications: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        classification: true,
                        major: true,
                        minor: true,
                        gpa: true,
                        createdAt: true,
                        lastModified: true, // ✅ this drives your status pill
                        submittedAt: true,
                        status: true
                    }
                }
            }
        });

        return ok(account);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}

export async function PATCH(req: Request) {
    const authed = await requireUser();
    if ("response" in authed) return authed.response;

    try {
        const body = await req.json();

        const updated = await prisma.accounts.update({
            where: { id: authed.user.id },
            data: {
                firstName: body.firstName ?? undefined,
                lastName: body.lastName ?? undefined,
                majors: body.majors ?? undefined,
                minors: body.minors ?? undefined,
                schoolEmail: body.schoolEmail ?? undefined,
                personalEmail: body.personalEmail ?? undefined,
                gradSemester: body.gradSemester ?? undefined,
                phoneNum: body.phoneNum ?? undefined,
                gradYear: body.gradYear ?? undefined,
                pledgeClass: body.pledgeClass ?? undefined,
                hometown: body.hometown ?? undefined,
                linkedin: body.linkedin ?? undefined,
                github: body.github ?? undefined
            }
        });

        return ok(updated);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
