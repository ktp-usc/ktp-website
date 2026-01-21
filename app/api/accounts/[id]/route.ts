import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { badRequest, ok, serverError } from "@/lib/http/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`missing_env_${ name }`);
    return v;
}

async function deleteNeonAuthUser(authUserId: string): Promise<boolean> {
    // Neon API: DELETE /projects/{project_id}/branches/{branch_id}/auth/users/{auth_user_id}
    // Docs reference: https://api-docs.neon.tech/reference/deletebranchneonauthuser
    const projectId = requireEnv("NEXT_NEON_AUTH_PROJECT_ID");
    const branchId = requireEnv("NEXT_NEON_AUTH_BRANCH_ID");
    const apiKey = requireEnv("NEON_AUTH_API_KEY");

    const url = `https://console.neon.tech/api/v2/projects/${ projectId }/branches/${ branchId }/auth/users/${ encodeURIComponent(authUserId) }`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            accept: "application/json",
            authorization: `Bearer ${apiKey}`
        }
    });

    // treat 404 as already deleted
    if (res.status === 404) return true;

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`neon_auth_delete_failed_${ res.status }_${ body.slice(0, 300) }`);
    }
    return true;
}

export async function GET(_: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ("response" in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const account = await prisma.accounts.findUnique({ where: { id } });
        if (!account) return badRequest("account_not_found");
        return ok(account);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}

export async function PATCH(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ("response" in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const body = await req.json();

        const updated = await prisma.accounts.update({
            where: { id },
            data: {
                firstName: body.firstName ?? undefined,
                lastName: body.lastName ?? undefined,
                majors: body.majors ?? undefined,
                minors: body.minors ?? undefined,
                type: body.type ?? undefined,
                schoolEmail: body.schoolEmail ?? undefined,
                personalEmail: body.personalEmail ?? undefined,
                gradSemester: body.gradSemester ?? undefined,
                headshotBlobURL: body.headshotBlobURL ?? undefined,
                resumeBlobURL: body.resumeBlobURL ?? undefined,
                leaderType: body.leaderType ?? undefined,
                phoneNum: body.phoneNum ?? undefined,
                isNew: body.isNew ?? undefined,
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

export async function DELETE(_: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ("response" in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        // if your Neon Auth user id differs from `accounts.id`, change this mapping.
        const authDeleted = await deleteNeonAuthUser(id);
        if (!authDeleted) return serverError();

        await prisma.accounts.delete({ where: { id } });
        return ok({ ok: true });
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
