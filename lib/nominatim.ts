const NominatimUserAgent = "Zenith/1.0 (+https://github.com)";
const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 20;

type RateLimitBucket = {
  hits: number[];
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export class NominatimRateLimitError extends Error {
  status = 429;

  constructor(message = "Too many location requests. Please try again soon.") {
    super(message);
    this.name = "NominatimRateLimitError";
  }
}

export function getNominatimHeaders() {
  return {
    "User-Agent": NominatimUserAgent,
    Accept: "application/json",
  };
}

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  return clientIp;
}

export function assertNominatimRateLimit(scope: string, clientIdentifier: string) {
  const bucketKey = `${scope}:${clientIdentifier}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(bucketKey) ?? { hits: [] };

  bucket.hits = bucket.hits.filter((timestamp) => now - timestamp < rateLimitWindowMs);

  if (bucket.hits.length >= maxRequestsPerWindow) {
    throw new NominatimRateLimitError();
  }

  bucket.hits.push(now);
  rateLimitBuckets.set(bucketKey, bucket);
}