import { useMemo } from "react";

import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useSessionQuery } from "@/client/hooks/auth";
import { portalHomePath, toPortalRole } from "@/lib/auth/roles";

export function usePortalSession() {
  const session = useSessionQuery();
  const account = useMyAccountQuery();
  const userId = session.data?.user?.id ?? null;
  const isLoading = session.isFetching || account.isFetching;
  const type = account.data?.type ?? null;
  const firstName = useMemo(
    () => account.data?.firstName?.trim() || "there",
    [account.data?.firstName],
  );
  const role = toPortalRole(type);
  const homePath = portalHomePath(type);

  return {
    session,
    account,
    userId,
    isLoading,
    type,
    firstName,
    role,
    homePath,
  };
}
