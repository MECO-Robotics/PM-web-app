/// <reference types="jest" />

import {
  renderManufacturingModal,
  renderManufacturingModalWithPartInstances,
  renderMaterialModal,
} from "./WorkspaceModals.manufacturing.test.helpers";

describe("Workspace modals - manufacturing and materials", () => {
  it("renders the in-house checkbox only for CNC manufacturing jobs", () => {
    expect(renderManufacturingModal("cnc")).toContain("In-house");
    expect(renderManufacturingModal("3d-print")).not.toContain("In-house");
    expect(renderManufacturingModal("fabrication")).not.toContain("In-house");
  });

  it("hides mentor reviewed in create mode but keeps it in edit mode", () => {
    expect(renderManufacturingModal("cnc", "create")).not.toContain("Mentor reviewed");
    expect(renderManufacturingModal("cnc", "edit")).toContain("Mentor reviewed");
  });

  it("starts manufacturing creation with part definition and scoped part instances", () => {
    (["cnc", "3d-print", "fabrication"] as const).forEach((process) => {
      const markup = renderManufacturingModalWithPartInstances(process);

      expect(markup.indexOf("Part definition")).toBeGreaterThan(-1);
      expect(markup.indexOf("Part definition")).toBeLessThan(markup.indexOf("Requester"));
      expect(markup).toContain("Part instances");
      expect(markup).toContain("Drive / Gearbox");
      expect(markup).not.toContain(">Title</span>");
      expect(markup).not.toContain(">Subsystem</span>");
      expect(markup).not.toContain(">Process</span>");
    });
  });

  it("hides the unit field in material create and edit modals", () => {
    expect(renderMaterialModal("create")).not.toContain(">Unit</span>");
    expect(renderMaterialModal("edit")).not.toContain(">Unit</span>");
  });
});
