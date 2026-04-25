/// <reference types="jest" />
/// <reference types="node" />

import { readFileSync } from "node:fs";
import { join } from "node:path";

const appCss = readFileSync(join(process.cwd(), "src/app/App.css"), "utf8");

function getCssBlock(selector: string) {
  const blockStart = appCss.indexOf(`${selector} {`);
  expect(blockStart).toBeGreaterThanOrEqual(0);

  const blockEnd = appCss.indexOf("}", blockStart);
  expect(blockEnd).toBeGreaterThan(blockStart);

  return appCss.slice(blockStart, blockEnd);
}

describe("App.css theme-safe badges", () => {
  it("uses theme status variables for shared status pills", () => {
    for (const group of ["success", "info", "warning", "danger", "neutral"]) {
      const block = getCssBlock(`.status-pill-${group}`);

      expect(block).toContain(`background: var(--status-${group}-bg);`);
      expect(block).toContain(`color: var(--status-${group}-text);`);
    }
  });

  it("keeps roster role badges on defined theme variables", () => {
    const block = getCssBlock(".member-role-badge");

    expect(block).toContain("background: var(--status-info-bg);");
    expect(block).toContain("color: var(--status-info-text);");
  });
});
