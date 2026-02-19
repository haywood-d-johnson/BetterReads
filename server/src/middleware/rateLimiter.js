const RATE_LIMIT = 3;
const RATE_WINDOW = 1000;
let requestTimestamps = [];

export async function throttledFetch(url, userAgent) {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_WINDOW);
  if (requestTimestamps.length >= RATE_LIMIT) {
    const waitMs = RATE_WINDOW - (now - requestTimestamps[0]);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  requestTimestamps.push(Date.now());
  return fetch(url, { headers: { "User-Agent": userAgent } });
}
