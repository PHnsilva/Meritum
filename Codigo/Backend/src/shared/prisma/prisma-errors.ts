export function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

export function isForeignKeyConstraintError(error: unknown) {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && error.code === 'P2003') return true;
  // Raw Postgres RESTRICT/FK violation (23001, 23503) surfaced as PrismaClientUnknownRequestError
  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    const msg = (error as { message: string }).message;
    return msg.includes('"23001"') || msg.includes('"23503"') || msg.includes('foreign key constraint');
  }
  return false;
}
