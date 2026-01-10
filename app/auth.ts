import { createAuthClient } from "@neondatabase/neon-js/auth";

const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
if (!neonAuthUrl) {
  throw new Error("NEXT_PUBLIC_NEON_AUTH_URL is not set");
}

export const authClient = createAuthClient(neonAuthUrl);
