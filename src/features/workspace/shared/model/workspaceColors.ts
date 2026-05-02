const WORKSPACE_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const WORKSPACE_COLOR_PALETTE = [
  "#E76F51",
  "#F4A261",
  "#E9C46A",
  "#2A9D8F",
  "#4F86C6",
  "#7A5CFA",
  "#C855BC",
  "#D64550",
] as const;

function hashWorkspaceColorSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function normalizeWorkspaceColor(color: string | null | undefined) {
  if (typeof color !== "string") {
    return null;
  }

  const trimmedColor = color.trim().toUpperCase();
  return WORKSPACE_COLOR_PATTERN.test(trimmedColor) ? trimmedColor : null;
}

export function getSuggestedWorkspaceColor(seed: string, fallbackIndex = 0) {
  const paletteIndex = seed.length > 0
    ? hashWorkspaceColorSeed(seed) % WORKSPACE_COLOR_PALETTE.length
    : Math.abs(fallbackIndex) % WORKSPACE_COLOR_PALETTE.length;
  return WORKSPACE_COLOR_PALETTE[paletteIndex];
}

export function resolveWorkspaceColor(
  color: string | null | undefined,
  seed: string,
  fallbackIndex = 0,
) {
  return normalizeWorkspaceColor(color) ?? getSuggestedWorkspaceColor(seed, fallbackIndex);
}
