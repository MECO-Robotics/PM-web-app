/// <reference types="jest" />

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HelpView } from "@/features/workspace/views/HelpView";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe("HelpView", () => {
  it("documents practical workspace scope, tab behavior, and roster guidance", () => {
    const html = renderToStaticMarkup(React.createElement(HelpView));

    expect(html).toContain("Start with scope");
    expect(html).toContain("<strong>No data:</strong>");
    expect(html).toContain("verify season, project, and person filter in that order.");
    expect(html).toContain("CNC, prints, and fabrication queues");
    expect(html).toContain("Students, Mentors, and External access");
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
    expect(html).toContain("Set season and project first");
    expect(html).toContain("Next step");
    expect(html).toContain("Close tutorial");
  });

  it("renders a completion state when the tutorial is finished", () => {
    const html = renderToStaticMarkup(
      React.createElement(HelpView, {
        tutorialInitiallyComplete: true,
        tutorialInitiallyOpen: true,
      }),
    );

    expect(html).toContain('data-tutorial-state="complete"');
    expect(html).toContain("Tutorial complete");
    expect(html).toContain("You are ready to run the workspace loop");
    expect(html).toContain("Review last step");
    expect(html).toContain("Start again");
  });
});
