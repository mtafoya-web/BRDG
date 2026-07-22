export function getHazardTimestamp(value) {
  const time = String(value || "").trim();
  const firmsTime = time.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,4})$/);

  if (firmsTime) {
    const clock = firmsTime[2].padStart(4, "0");
    const parsed = Date.parse(
      `${firmsTime[1]}T${clock.slice(0, 2)}:${clock.slice(2)}:00Z`
    );

    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Date.parse(time);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortHazardsByTime(hazards, order) {
  const direction = order === "oldest" ? 1 : -1;

  return [...hazards].sort(
    (a, b) =>
      direction * (getHazardTimestamp(a.time) - getHazardTimestamp(b.time))
  );
}

export function sortHazards(hazards, { cityOrder, timeOrder }) {
  const cityDirection = cityOrder === "za" ? -1 : 1;
  const timeDirection = timeOrder === "oldest" ? 1 : -1;

  return [...hazards].sort((a, b) => {
    if (cityOrder !== "none") {
      const cityComparison = String(a.city || "Unknown").localeCompare(
        String(b.city || "Unknown")
      );

      if (cityComparison !== 0) {
        return cityDirection * cityComparison;
      }
    }

    return (
      timeDirection *
      (getHazardTimestamp(a.time) - getHazardTimestamp(b.time))
    );
  });
}
