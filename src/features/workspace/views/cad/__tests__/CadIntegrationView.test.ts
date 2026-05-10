/// <reference types="jest" />

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CadIntegrationView } from "../CadIntegrationView";
import { createOnshapeDocumentRef, fetchOnshapeImportEstimate, runOnshapeImport } from "../api/onshapeCadApi";
import { CadStatusPanels } from "../components/CadStatusPanels";
import { parseOnshapeUrl } from "../model/onshapeUrlParser";

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

    expect(markup).toContain("CAD / Onshape integration");
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
});
