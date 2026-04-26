/// <reference types="jest" />

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HelpView } from "@/features/workspace/views/HelpView";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe("HelpView", () => {
  it("documents the current workspace tabs and roster access model", () => {
    const html = renderToStaticMarkup(React.createElement(HelpView));

    expect(html).toContain("CNC, prints, and fabrication");
    expect(html).toContain("Documents and Purchases");
    expect(html).toContain("External access");
    expect(html).toContain("season selector");
  });

  it("offers a tutorial launch point inside help", () => {
    const html = renderToStaticMarkup(React.createElement(HelpView));

    expect(html).toContain("Start tutorial");
    expect(html).toContain('data-tutorial-launch="help"');
  });

  it("renders guided tutorial content when launched", () => {
    const html = renderToStaticMarkup(
      React.createElement(HelpView, { tutorialInitiallyOpen: true }),
    );

    expect(html).toContain("Guided workspace tutorial");
    expect(html).toContain("Step 1 of 6");
    expect(html).toContain("Choose season and project scope");
    expect(html).toContain("Finish tutorial");
  });
});
