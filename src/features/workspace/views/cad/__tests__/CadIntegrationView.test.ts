/// <reference types="jest" />

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CadIntegrationView } from "../CadIntegrationView";
import { uploadCadStepFile } from "../api/cadStepApi";
import { createOnshapeDocumentRef, fetchOnshapeImportEstimate, runOnshapeImport } from "../api/onshapeCadApi";
import { CadStepReviewPanels } from "../components/CadStepReviewPanels";
import { CadStatusPanels } from "../components/CadStatusPanels";
import { parseOnshapeUrl } from "../model/onshapeUrlParser";

jest.mock("../api/cadStepApi", () => ({
  fetchCadSnapshots: jest.fn(),
  fetchCadSnapshotSummary: jest.fn(),
  fetchCadSnapshotTree: jest.fn(),
  fetchCadSnapshotMappings: jest.fn(),
  fetchCadSnapshotDiff: jest.fn(),
  uploadCadStepFile: jest.fn(),
  applyCadSnapshotMappings: jest.fn(),
  finalizeCadSnapshot: jest.fn(),
}));

jest.mock("../api/onshapeCadApi", () => ({
  fetchOnshapeOverview: jest.fn(),
  fetchOnshapeImportEstimate: jest.fn(),
  createOnshapeDocumentRef: jest.fn(),
  runOnshapeImport: jest.fn(),
}));

describe("CAD / Onshape integration view", () => {
  it("parses common Onshape references for preview without network calls", () => {
    const workspace = parseOnshapeUrl(
      "https://cad.onshape.com/documents/0123456789abcdef01234567/w/abcdefabcdefabcdefabcdef/e/111111111111111111111111?renderMode=0",
    );
    expect(workspace.ok).toBe(true);
    expect(workspace.referenceType).toBe("workspace");
    expect(workspace.workspaceId).toBe("abcdefabcdefabcdefabcdef");
    expect(workspace.elementId).toBe("111111111111111111111111");

    const version = parseOnshapeUrl(
      "https://cad.onshape.com/documents/0123456789abcdef01234567/v/222222222222222222222222/e/111111111111111111111111",
    );
    expect(version.referenceType).toBe("version");
    expect(version.versionId).toBe("222222222222222222222222");

    const microversion = parseOnshapeUrl(
      "https://cad.onshape.com/documents/0123456789abcdef01234567/m/333333333333333333333333/e/111111111111111111111111",
    );
    expect(microversion.referenceType).toBe("microversion");
    expect(microversion.microversionId).toBe("333333333333333333333333");

    const missingElement = parseOnshapeUrl(
      "https://cad.onshape.com/documents/0123456789abcdef01234567/v/222222222222222222222222",
    );
    expect(missingElement.ok).toBe(true);
    expect(missingElement.errors.join(" ")).toMatch(/elementId/);

    expect(parseOnshapeUrl("https://example.com/documents/x/w/y/e/z").ok).toBe(false);
    expect(parseOnshapeUrl("not-a-url").ok).toBe(false);
  });

  it("does not trigger Onshape sync actions during page render", () => {
    const markup = renderToStaticMarkup(React.createElement(CadIntegrationView, {}));

    expect(markup).toContain("CAD / STEP mapper");
    expect(markup).toContain("Export from the master assembly");
    expect(markup).toContain("MECH - Shooter - Flywheel");
    expect(uploadCadStepFile).not.toHaveBeenCalled();
    expect(createOnshapeDocumentRef).not.toHaveBeenCalled();
    expect(fetchOnshapeImportEstimate).not.toHaveBeenCalled();
    expect(runOnshapeImport).not.toHaveBeenCalled();
  });

  it("renders backend sync estimates when available", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CadStatusPanels, {
        overview: null,
        selectedReferenceType: "version",
        selectedSyncLevel: "bom",
        syncEstimate: {
          documentRefId: "onshape-ref-1",
          syncLevel: "bom",
          callsEstimated: 2,
          allowCached: true,
          requireFresh: false,
          immutableReference: true,
          referenceType: "version",
          cacheStatus: "hit",
          perSyncSoftBudget: 25,
          budgetAllowsSync: true,
          warnings: [],
        },
      }),
    );

    expect(markup).toContain("2 calls");
    expect(markup).toContain("cache hit");
    expect(markup).toContain("within budget");
  });

  it("renders mapping review state with carry-forward scope and finalize guard", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CadStepReviewPanels, {
        diff: {
          previousSnapshotId: "cad-snapshot-1",
          addedAssemblies: [{ id: "asm-intake", name: "MECH - Intake", instancePath: "/Robot/MECH - Intake" }],
          removedAssemblies: [],
          movedAssemblies: [],
          addedParts: [],
          removedParts: [],
          movedPartInstances: [],
          mappingChanges: [],
          warnings: [],
        },
        isFinalizing: false,
        isSavingMapping: false,
        mappings: [{
          id: "mapping-1",
          snapshotId: "cad-snapshot-2",
          mappingRuleId: null,
          sourceKind: "ASSEMBLY_NODE",
          sourceId: "cad-assembly-1",
          sourceName: "MECH - Shooter - Flywheel",
          targetKind: "UNMAPPED",
          targetId: null,
          confidence: "LOW",
          status: "NEEDS_REVIEW",
          rule: null,
          updatedAt: "2026-05-10T00:00:00.000Z",
        }],
        onConfirmMapping: jest.fn(),
        onFinalize: jest.fn(),
        snapshot: {
          id: "cad-snapshot-2",
          projectId: "project-robot-2026",
          seasonId: "season-2026",
          importRunId: "cad-import-2",
          source: "STEP_UPLOAD",
          label: "Iteration 2",
          uploadedFileHash: "hash",
          previousSnapshotId: "cad-snapshot-1",
          status: "mapping_review",
          createdBy: null,
          createdAt: "2026-05-10T00:00:00.000Z",
          finalizedBy: null,
          finalizedAt: null,
          notes: null,
        },
        summary: {
          assemblyCount: 2,
          partDefinitionCount: 1,
          partInstanceCount: 1,
          maxDepth: 2,
          parserVersion: "mock-step-parser-json-1",
          warningCount: 1,
          mappingCount: 3,
        },
        targets: {
          subsystems: [{ id: "subsystem-shooter", projectId: "project-robot-2026", name: "Shooter", description: "", iteration: 1, isCore: false, parentSubsystemId: null, responsibleEngineerId: null, mentorIds: [], risks: [] }],
          mechanisms: [{ id: "mechanism-flywheel", subsystemId: "subsystem-shooter", name: "Flywheel", description: "", iteration: 1 }],
          partDefinitions: [{ id: "part-spacer", seasonId: "season-2026", name: "Spacer", partNumber: "SHR-001", revision: "A", iteration: 1, type: "custom", source: "cad", materialId: null, description: "" }],
        },
        tree: [],
        warnings: [{
          id: "warning-1",
          importRunId: "cad-import-2",
          snapshotId: "cad-snapshot-2",
          severity: "WARNING",
          code: "step_unmapped_assembly",
          title: "Assembly is unmapped",
          message: "MECH - Shooter - Flywheel needs review.",
          sourceKind: "ASSEMBLY_NODE",
          sourceId: "cad-assembly-1",
          createdAt: "2026-05-10T00:00:00.000Z",
        }],
      }),
    );

    expect(markup).toContain("MECH - Shooter - Flywheel");
    expect(markup).toContain("This snapshot and future imports");
    expect(markup).toContain("Finalize with unresolved warnings");
    expect(markup).toContain("Added assemblies: 1");
    expect(markup).toContain("step_unmapped_assembly");
  });
});
