const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

export function rangeProgress(p, start, end) {
  if (end <= start) return p >= end ? 1 : 0;
  return clamp01((p - start) / (end - start));
}

export function buildTimeline(chapters) {
  const total = chapters.reduce((sum, chapter) => sum + chapter.weight, 0);
  let acc = 0;
  const ranges = chapters.map((chapter) => {
    const start = acc / total;
    acc += chapter.weight;
    const end = acc / total;
    const count = chapter.beats.length;
    const beats = chapter.beats.map((_, i) => ({
      start: start + ((end - start) * i) / count,
      end: start + ((end - start) * (i + 1)) / count,
    }));
    return { id: chapter.id, start, end, beats };
  });
  const byId = Object.fromEntries(ranges.map((range) => [range.id, range]));

  function at(ref) {
    const [id, beat = "0"] = ref.split(":");
    return byId[id].beats[Number(beat)];
  }

  function chapterIndexAt(p) {
    const index = ranges.findIndex((range) => p < range.end);
    return index === -1 ? ranges.length - 1 : index;
  }

  function windowed(p, ref, outRef) {
    const enter = at(ref);
    const fadeIn = (enter.end - enter.start) * 0.45;
    let value = smooth(rangeProgress(p, enter.start, enter.start + fadeIn));
    if (outRef) {
      const exit = at(outRef);
      const fadeOut = (exit.end - exit.start) * 0.35;
      value *= 1 - smooth(rangeProgress(p, exit.start, exit.start + fadeOut));
    }
    return value;
  }

  function visibility(p, windows) {
    return windows.reduce((best, [ref, outRef]) => Math.max(best, windowed(p, ref, outRef)), 0);
  }

  function beatAlpha(p, beat, isLast) {
    const len = beat.end - beat.start;
    const fadeIn = smooth(rangeProgress(p, beat.start, beat.start + len * 0.15));
    const fadeOut = isLast && p >= 1 ? 1 : 1 - smooth(rangeProgress(p, beat.end - len * 0.12, beat.end));
    return fadeIn * fadeOut;
  }

  return { total, ranges, at, chapterIndexAt, visibility, beatAlpha };
}
