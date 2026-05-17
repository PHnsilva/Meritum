import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function generateTempPassword(): string {
  return randomBytes(5).toString('hex'); // 10 chars hex legível
}

const keyLength = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, keyLength).toString('hex');

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPasswordHash: string) {
  const [salt, hash] = storedPasswordHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const storedHash = Buffer.from(hash, 'hex');
  const candidateHash = scryptSync(password, salt, keyLength);

  return storedHash.length === candidateHash.length && timingSafeEqual(storedHash, candidateHash);
}
