import { useState, useEffect } from "react";
import { accounts, type as AccountType } from "@prisma/client";

function accountsUrl(options?: { q?: string; types?: AccountType[] }) {
  const params = new URLSearchParams();
  if (options?.q) params.set("q", options.q);
  if (options?.types?.length) params.set("types", options.types.join(","));
  const query = params.toString();
  return query ? `/api/accounts?${query}` : "/api/accounts";
}

export function useAccounts(options?: {
  types?: AccountType[];
  enabled?: boolean;
}) {
  const [accounts, setAccounts] = useState<accounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const enabled = options?.enabled ?? true;
  const typesKey = options?.types?.join(",") ?? "";

  async function getAccounts() {
    try {
      setLoading(true);
      const res = await fetch(
        accountsUrl({ q: search, types: options?.types }),
      );
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setAccounts(data.data.items);
    } catch (error) {
      return console.error(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!enabled) return;
    getAccounts();
  }, [search, typesKey, enabled]);

  return { loading, accounts, search, setSearch };
}

export function useNumAccounts(types?: AccountType[]) {
  const [numAccounts, setNumAccounts] = useState(0);
  const [loading, setLoading] = useState(false);
  const typesKey = types?.join(",") ?? "";

  async function getNumAccounts() {
    try {
      setLoading(true);
      const res = await fetch(accountsUrl({ types }));
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setNumAccounts(data.data.total);
    } catch (error) {
      return console.error(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getNumAccounts();
  }, [typesKey]);
  return { numAccounts, loading };
}
