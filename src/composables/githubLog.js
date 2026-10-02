export const GITHUB_USER = "AbhiramKrishnaM";

const CACHE_KEY = "gitlog-cache-v1";
const CACHE_TTL_MS = 10 * 60 * 1000;
const COMMIT_LIMIT = 10;

export class GitLogError extends Error {
  constructor(kind, { status, resetAt } = {}) {
    super(kind);
    this.kind = kind;
    this.status = status;
    this.resetAt = resetAt;
  }
}

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
    return;
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

export function timeAgo(date, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - new Date(date).getTime()) / 1000));
  if (s < 60) return "just now";
  const units = [["m", 60], ["h", 24], ["d", 7], ["w", 4.345], ["mo", 12], ["y", Infinity]];
  let value = s / 60;
  for (const [unit, size] of units) {
    if (value < size) return `${Math.floor(value)}${unit} ago`;
    value /= size;
  }
}
