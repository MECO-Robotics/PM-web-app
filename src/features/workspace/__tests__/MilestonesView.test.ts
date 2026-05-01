/// <reference types="jest" />

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EMPTY_BOOTSTRAP } from "@/features/workspace/shared";
import { MilestonesView } from "@/features/workspace/views/milestones/MilestonesView";
import type { BootstrapPayload } from "@/types";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function createBootstrap(): BootstrapPayload {
  return {
    ...EMPTY_BOOTSTRAP,
    members: [
      {
        id: "member-1",
        name: "Alex Builder",
        email: "alex@example.com",
        role: "student",
        elevated: false,
        seasonId: "season-1",
      },
      {
        id: "member-2",
        name: "Jordan Mentor",
        email: "jordan@example.com",
        role: "mentor",
        elevated: true,
        seasonId: "season-1",
      },
    ],
    projects: [
      {
        id: "project-1",
        seasonId: "season-1",
        name: "Robot",
        projectType: "robot",
        description: "",
        status: "active",
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Regional",
        type: "competition",
        startDateTime: "2026-03-10T14:00:00.000Z",
        endDateTime: null,
        isExternal: true,
        description: "Competition readiness checkpoint",
        projectIds: ["project-1"],
        relatedSubsystemIds: [],
      },
      {
        id: "event-2",
        title: "Design review",
        type: "deadline",
        startDateTime: "2026-03-12T14:00:00.000Z",
        endDateTime: null,
        isExternal: false,
        description: "Subsystem review",
        projectIds: ["project-1"],
        relatedSubsystemIds: [],
      },
    ],
    tasks: [
      {
        id: "task-1",
        projectId: "project-1",
        workstreamId: null,
        workstreamIds: [],
        subsystemId: "subsystem-1",
        subsystemIds: ["subsystem-1"],
        disciplineId: "discipline-1",
        mechanismId: null,
        mechanismIds: [],
        partInstanceId: null,
        partInstanceIds: [],
        title: "Prep robot",
        summary: "Prepare for regional",
        status: "in-progress",
        ownerId: "member-1",
        assigneeIds: [],
        mentorId: null,
        startDate: "2026-03-01",
        dueDate: "2026-03-09",
        priority: "high",
        targetEventId: "event-1",
        dependencyIds: [],
        blockers: [],
        isBlocked: false,
        linkedManufacturingIds: [],
        linkedPurchaseIds: [],
        estimatedHours: 0,
        actualHours: 0,
        requiresDocumentation: false,
        documentationLinked: false,
      },
      {
        id: "task-2",
        projectId: "project-1",
        workstreamId: null,
        workstreamIds: [],
        subsystemId: "subsystem-1",
        subsystemIds: ["subsystem-1"],
        disciplineId: "discipline-1",
        mechanismId: null,
        mechanismIds: [],
        partInstanceId: null,
        partInstanceIds: [],
        title: "Review drawings",
        summary: "Prepare review deck",
        status: "not-started",
        ownerId: "member-2",
        assigneeIds: [],
        mentorId: null,
        startDate: "2026-03-02",
        dueDate: "2026-03-11",
        priority: "medium",
        targetEventId: "event-2",
        dependencyIds: [],
        blockers: [],
        isBlocked: false,
        linkedManufacturingIds: [],
        linkedPurchaseIds: [],
        estimatedHours: 0,
        actualHours: 0,
        requiresDocumentation: false,
        documentationLinked: false,
      },
    ],
    subsystems: [
      {
        id: "subsystem-1",
        projectId: "project-1",
        name: "Drive",
        description: "",
        iteration: 1,
        isCore: true,
        parentSubsystemId: null,
        responsibleEngineerId: null,
        mentorIds: [],
        risks: [],
      },
    ],
  };
}

describe("MilestonesView", () => {
  it("renders milestones as kanban columns grouped by type", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MilestonesView, {
        activePersonFilter: [],
        bootstrap: createBootstrap(),
        isAllProjectsView: false,
        onDeleteTimelineEvent: jest.fn(),
        onSaveTimelineEvent: jest.fn(),
        subsystemsById: {},
      }),
    );

    expect(markup).toContain("task-queue-board");
    expect(markup).toContain("task-queue-board-column");
    expect(markup).toContain("task-queue-board-card");
    expect(markup).toContain("Competition");
    expect(markup).toContain("Deadline");
  });

  it("renders type chips with dark-mode-safe palette variables", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MilestonesView, {
        activePersonFilter: [],
        bootstrap: createBootstrap(),
        isAllProjectsView: false,
        onDeleteTimelineEvent: jest.fn(),
        onSaveTimelineEvent: jest.fn(),
        subsystemsById: {},
      }),
    );

    expect(markup).toContain("milestone-type-pill");
    expect(markup).toContain("--milestone-type-chip-bg-dark");
    expect(markup).toContain("--milestone-type-chip-text-dark");
    expect(markup).not.toContain("color:#1f3f7a");
  });

  it("filters milestones to the active person via linked tasks", () => {
    const bootstrap = createBootstrap();
    const markup = renderToStaticMarkup(
      React.createElement(MilestonesView, {
        activePersonFilter: ["member-1"],
        bootstrap,
        isAllProjectsView: false,
        onDeleteTimelineEvent: jest.fn(),
        onSaveTimelineEvent: jest.fn(),
        subsystemsById: {
          "subsystem-1": bootstrap.subsystems[0],
        },
      }),
    );

    expect(markup).toContain("Regional");
    expect(markup).not.toContain("Design review");
    expect(markup).toContain("Only milestones linked to tasks assigned to or mentored by Alex Builder.");
  });

  it("falls back to the default style label when an event type is invalid", () => {
    const bootstrap = createBootstrap();
    bootstrap.events = [
      {
        ...bootstrap.events[0],
        id: "event-legacy",
        title: "Legacy milestone",
        type: "milestone" as never,
      },
    ];

    const render = () =>
      renderToStaticMarkup(
        React.createElement(MilestonesView, {
          activePersonFilter: [],
          bootstrap,
          isAllProjectsView: false,
          onDeleteTimelineEvent: jest.fn(),
          onSaveTimelineEvent: jest.fn(),
          subsystemsById: {
            "subsystem-1": bootstrap.subsystems[0],
          },
        }),
      );

    expect(render).not.toThrow();
    expect(render()).toContain("Internal review");
    expect(render()).toContain("Legacy milestone");
  });
});
