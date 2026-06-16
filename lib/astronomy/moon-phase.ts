export function getMoonPhaseName(phase: number, illuminationPct: number) {
  if (illuminationPct <= 1 || phase <= 0.03 || phase >= 0.97) {
    return "New Moon";
  }

  if (phase < 0.22) {
    return "Waxing Crescent";
  }

  if (phase < 0.28) {
    return "First Quarter";
  }

  if (phase < 0.47) {
    return "Waxing Gibbous";
  }

  if (phase < 0.53) {
    return "Full Moon";
  }

  if (phase < 0.72) {
    return "Waning Gibbous";
  }

  if (phase < 0.78) {
    return "Last Quarter";
  }

  return "Waning Crescent";
}

export function formatAstronomyTime(date: Date | null) {
  return date ? date.toISOString() : null;
}

export function formatAstronomyLabel(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(date) : "—";
}
