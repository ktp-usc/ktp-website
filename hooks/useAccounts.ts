import { useState, useEffect } from "react";
import { accounts } from "@prisma/client";

export function useAccounts() {
  const [accounts, setAccounts] = useState<accounts[]>([]);
  const [loading, setLoading] = useState(false);

  async function getAccounts() {
    try {
      setLoading(true);
      const res = await fetch("/api/accounts");
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
    getAccounts();
  }, []);

  return { loading, accounts };
}

export function useNumAccounts() {
  const [numAccounts, setNumAccounts] = useState(0);
  const [loading, setLoading] = useState(false);

  async function getNumAccounts() {
    try {
      setLoading(true);
      const res = await fetch("/api/accounts");
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      console.log(data.data);
      setNumAccounts(data.data.total);
    } catch (error) {
      return console.error(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getNumAccounts();
  }, []);
  return { numAccounts, loading };
}
