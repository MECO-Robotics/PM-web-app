const FILTER_TONE_CLASSES = [
  "filter-tone-info",
  "filter-tone-success",
  "filter-tone-warning",
  "filter-tone-danger",
  "filter-tone-neutral",
] as const;

export function getStableToneClassName(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  // Keep tone assignment deterministic so the same entity always gets the same pill tone.
  return FILTER_TONE_CLASSES[hash % FILTER_TONE_CLASSES.length];
}

export function getPriorityToneClassName(priority: string | undefined) {
  if (priority === "critical") {
    return "filter-tone-danger";
  }

  if (priority === "high") {
    return "filter-tone-warning";
  }

  if (priority === "low") {
    return "filter-tone-success";
  }

  return "filter-tone-neutral";
}
