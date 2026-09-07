import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import BidLetterClientPage from "@/app/portal/bid-letter/BidLetterClientPage";
import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BidLetterPageProps = {
  searchParams: Promise<{ applicationId?: string }>;
};

export default async function BidLetterPage({ searchParams }: BidLetterPageProps) {
  const authed = await requireUser();
  if ("response" in authed) {
    redirect("/portal");
  }

  const { applicationId } = await searchParams;

  const app = applicationId
    ? await prisma.applications.findFirst({
        where: { id: applicationId, userId: authed.user.id },
        select: { id: true, status: true },
      })
    : await prisma.applications.findFirst({
        where: { userId: authed.user.id, status: "BID_OFFERED" },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      });

  if (!app || app.status !== "BID_OFFERED") {
    redirect("/portal");
  }

  return <BidLetterClientPage applicationId={app.id} />;
}
