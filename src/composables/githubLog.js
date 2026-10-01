/**
 * Recent public commits for the terminal's `git log` command.
 *
 * Uses GitHub's commit search API — the public events API no longer includes
 * commit messages in push events. Unauthenticated search allows only ~10
 * requests/minute per visitor, so results are cached in localStorage.
 */

export const GITHUB_USER = "AbhiramKrishnaM";

const CACHE_KEY = "gitlog-cache-v1";
const CACHE_TTL_MS = 10 * 60 * 1000;
const COMMIT_LIMIT = 10;

/** Thrown for API failures; `kind` picks the friendly message. */
export class GitLogError extends Error {
  constructor(kind, { status, resetAt } = {}) {
    super(kind);
    this.kind = kind; // "rate-limit" | "network" | "http"
    this.status = status;
    this.resetAt = resetAt; // ms timestamp when the rate limit resets
  }
}

// localStorage can throw (private mode, blocked storage) — the cache is only
// an optimisation, so every access is guarded.
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(commits) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), commits }));
  } catch {
    // ignore — next run just fetches again
  }
}

async function fetchCommits() {
  const q = encodeURIComponent(`author:${GITHUB_USER} merge:false`);
  const url = `https://api.github.com/search/commits?q=${q}&sort=author-date&order=desc&per_page=${COMMIT_LIMIT}`;

  let res;
  try {
    res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  } catch {
    throw new GitLogError("network");
  }

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    if (res.status === 429 || (res.status === 403 && remaining === "0")) {
      throw new GitLogError("rate-limit", { status: res.status, resetAt: reset ? reset * 1000 : null });
    }
    throw new GitLogError("http", { status: res.status });
  }

  const data = await res.json();
  return (data.items ?? []).map((item) => ({
    sha: item.sha.slice(0, 7),
    message: item.commit.message.split("\n")[0],
    repo: item.repository.name,
    date: item.commit.author.date,
    url: item.html_url,
  }));
}

/**
 * Returns { commits, fetchedAt, source } where source is "network", "cache"
 * (fresh cache hit), or "stale" (API failed, showing an older cached copy).
 * Throws GitLogError only when the API fails and there's nothing cached.
 */
export async function getRecentCommits() {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, source: "cache" };
  }
  try {
    const commits = await fetchCommits();
    writeCache(commits);
    return { commits, fetchedAt: Date.now(), source: "network" };
  } catch (err) {
    if (cached) return { ...cached, source: "stale", error: err };
    throw err;
  }
}

/** "just now", "5m ago", "3h ago", "2d ago", "3w ago", "4mo ago", "1y ago". */
export function timeAgo(date, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - new Date(date).getTime()) / 1000));
  if (s < 60) return "just now";
  // Each unit holds until the value reaches `size`, then rolls into the next.
  const units = [["m", 60], ["h", 24], ["d", 7], ["w", 4.345], ["mo", 12], ["y", Infinity]];
  let value = s / 60;
  for (const [unit, size] of units) {
    if (value < size) return `${Math.floor(value)}${unit} ago`;
    value /= size;
  }
}
