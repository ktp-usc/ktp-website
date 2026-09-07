import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { portalHomePath, toPortalRole } from "@/lib/auth/roles";

import ApplicantPortalPage from "./components/ApplicantPortalPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalHomePage() {
  const authed = await requireUser();
  if ("response" in authed) {
    return <ApplicantPortalPage />;
  }

  const account = await prisma.accounts.findUnique({
    where: { id: authed.user.id },
    select: { type: true },
  });

  if (toPortalRole(account?.type) !== "applicant") {
    redirect(portalHomePath(account?.type));
  }

  return <ApplicantPortalPage />;
}
