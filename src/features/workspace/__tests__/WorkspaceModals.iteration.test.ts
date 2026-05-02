/// <reference types="jest" />

import { renderIterationEditors, renderWorkstreamModal } from "./WorkspaceModals.iteration.test.helpers";

describe("Workspace modals - iteration and workflow editors", () => {
  it("hides iteration selectors while creating definition editors", () => {
    const markup = renderIterationEditors("create");

    expect(markup).not.toContain(">Iteration</span>");
  });

  it("renders iteration selectors for definition editors in edit mode", () => {
    const markup = renderIterationEditors("edit");

    expect(markup).toContain(">Iteration</span>");
    expect(markup).toContain("v1");
  });

  it("renders color controls for workflow and subsystem editors", () => {
    const workstreamMarkup = renderWorkstreamModal("edit");
    const subsystemMarkup = renderIterationEditors("edit");

    expect(workstreamMarkup).toContain('type="color"');
    expect(workstreamMarkup).toContain("Suggested palette");
    expect(subsystemMarkup).toContain('type="color"');
    expect(subsystemMarkup).toContain("Suggested palette");
  });
});
