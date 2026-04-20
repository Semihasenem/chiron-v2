const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(ip: string): { allowed: true } | { allowed: false; retryAfter: number } {
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
        buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        if (buckets.size > 1000) pruneExpired(now);
        return { allowed: true };
    }

    if (bucket.count >= MAX_REQUESTS) {
        return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count++;
    return { allowed: true };
}

function pruneExpired(now: number) {
    buckets.forEach((bucket, key) => {
        if (now > bucket.resetAt) buckets.delete(key);
    });
}

export function getClientIp(req: Request): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
}
