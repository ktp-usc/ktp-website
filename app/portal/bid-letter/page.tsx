import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import BidLetterClientPage from "@/app/portal/bid-letter/BidLetterClientPage";
import { requireUser } from "@/lib/auth/guards"; // adjust path to your prisma singleton

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BidLetterPage() {
    const authed = await requireUser();
    if ("response" in authed) {
        // if your requireUser returns a NextResponse for unauth, send them to portal
        redirect("/portal");
    }

    const app = await prisma.applications.findUnique({
        where: { userId: authed.user.id },
        select: { status: true }
    });

    if (!app || app.status !== "BID_OFFERED") {
        redirect("/portal");
    }

    return <BidLetterClientPage/>;
}
