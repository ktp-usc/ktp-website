import crypto from 'crypto';

export function getVoterHash(userId: string): string {
  const salt = process.env.VOTE_SALT ?? 'ktp-vote-salt';
  return crypto.createHash('sha256').update(`${userId}:${salt}`).digest('hex');
}
