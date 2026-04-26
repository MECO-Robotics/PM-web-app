/// <reference types="jest" />

import {
  filterSelectionIncludes,
  filterSelectionIntersects,
  pruneFilterSelection,
} from "@/features/workspace/shared";

describe("WorkspaceViewShared filters", () => {
  it("treats an empty selection as the all option", () => {
    expect(filterSelectionIncludes([], "subsystem-1")).toBe(true);
    expect(filterSelectionIntersects([], ["subsystem-1"])).toBe(true);
  });

  it("prunes stale selections when dropdown options change", () => {
    expect(
      pruneFilterSelection(
        ["old-subsystem", "current-subsystem"],
        [{ id: "current-subsystem", name: "Current subsystem" }],
      ),
    ).toEqual(["current-subsystem"]);
  });
});
