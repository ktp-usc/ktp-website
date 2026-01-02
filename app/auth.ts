import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(process.env.NEXT_NEON_AUTH_URL || 'https://ep-fragrant-sound-ad0nxnig.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth');