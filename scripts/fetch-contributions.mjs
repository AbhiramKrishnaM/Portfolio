import { writeFile, access } from "node:fs/promises";

const USER = "AbhiramKrishnaM";
const OUT = new URL("../src/data/contributions.json", import.meta.url);

async function exists(url) {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

function parse(html) {
  const counts = new Map();
  for (const m of html.matchAll(/for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    const id = tag.match(/id="([^"]+)"/)?.[1];
    if (date) days.push({ date, level, count: counts.get(id) ?? 0 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const total = Number(html.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1].replace(/,/g, "") ?? 0);
  return { user: USER, total, fetchedAt: new Date().toISOString().slice(0, 10), days };
}

try {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = parse(await res.text());
  if (data.days.length < 300) throw new Error(`only ${data.days.length} days parsed`);
  await writeFile(OUT, `${JSON.stringify(data)}\n`);
  console.log(`contributions: ${data.total} in the last year, ${data.days.length} days`);
} catch (err) {
  if (!(await exists(OUT))) {
    await writeFile(OUT, `${JSON.stringify({ user: USER, total: 0, fetchedAt: null, days: [] })}\n`);
  }
  console.warn(`contributions: fetch failed (${err.message}), keeping existing data`);
}
