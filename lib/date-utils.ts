export function getDynamicGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 0 && hour < 12) {
    return "MAGANDANG UMAGA · GOOD MORNING";
  } else if (hour >= 12 && hour < 13) {
    return "MAGANDANG TANGHALI · GOOD NOON";
  } else if (hour >= 13 && hour < 18) {
    return "MAGANDANG HAPON · GOOD AFTERNOON";
  } else {
    return "MAGANDANG GABI · GOOD EVENING";
  }
}

export function getPHTDate(): Date {
    const phtString = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const phtDate = new Date(phtString);
    // Returns a clean UTC Date object representing 00:00 of the PHT day.
    // e.g. If it's July 6 in PH, this returns 2026-07-06T00:00:00.000Z
    return new Date(Date.UTC(phtDate.getFullYear(), phtDate.getMonth(), phtDate.getDate()));
}
