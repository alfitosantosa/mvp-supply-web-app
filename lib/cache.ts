/**
 * Single cache tag for every Prisma read that goes through `unstable_cache`.
 * Every write route purges it, so a cache entry is never older than the last
 * mutation. Neon compute is billed per active second, so a read that can be
 * served from the Next.js data cache never wakes the database.
 */
export const DB_CACHE_TAG = "db";
