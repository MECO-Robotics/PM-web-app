/// <reference types="jest" />

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EMPTY_BOOTSTRAP } from "@/features/workspace/shared";
import { WorkLogsView } from "@/features/workspace/views";
import type { BootstrapPayload } from "@/types";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function renderWorkLogsView(view: "logs" | "qa" | "event-result" | "summary") {
  const bootstrap: BootstrapPayload = {
    ...EMPTY_BOOTSTRAP,
  };

  return renderToStaticMarkup(
    React.createElement(WorkLogsView, {
      activePersonFilter: [],
      bootstrap,
      membersById: {},
      openCreateWorkLogModal: jest.fn(),
      openCreateQaReportModal: jest.fn(),
      openCreateEventReportModal: jest.fn(),
      openEditTaskModal: jest.fn(),
      subsystemsById: {},
      view,
    }),
  );
}

describe("WorkLogsView", () => {
  it("renders a dedicated QA form tab", () => {
    const html = renderWorkLogsView("qa");

    expect(html).toContain("QA form");
    expect(html).toContain("Add QA report");
  });

  it("renders a dedicated Event Result form tab", () => {
    const html = renderWorkLogsView("event-result");

    expect(html).toContain("Event Result form");
    expect(html).toContain("Add event result");
  });
});
