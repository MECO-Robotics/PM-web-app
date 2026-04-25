/// <reference types="jest" />

import * as React from "react";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TaskEditorModal } from "@/features/workspace/WorkspaceModals";
import { EMPTY_BOOTSTRAP } from "@/features/workspace/shared";
import { buildEmptyTaskPayload } from "@/lib/appUtils";
import type { BootstrapPayload } from "@/types";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function createBootstrap(): BootstrapPayload {
  return {
    ...EMPTY_BOOTSTRAP,
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
    members: [
      {
        id: "student-1",
        name: "Student",
        email: "student@meco.test",
        role: "student",
        elevated: false,
        seasonId: "season-1",
      },
      {
        id: "mentor-1",
        name: "Mentor",
        email: "mentor@meco.test",
        role: "mentor",
        elevated: true,
        seasonId: "season-1",
      },
    ],
    subsystems: [
      {
        id: "subsystem-1",
        projectId: "project-1",
        name: "Drive",
        description: "",
        isCore: true,
        parentSubsystemId: null,
        responsibleEngineerId: null,
        mentorIds: [],
        risks: [],
      },
    ],
    disciplines: [
      {
        id: "discipline-1",
        code: "mechanical",
        name: "Mechanical",
      },
    ],
  };
}

function renderTaskModal(taskModalMode: ComponentProps<typeof TaskEditorModal>["taskModalMode"]) {
  const bootstrap = createBootstrap();
  const taskDraft = {
    ...buildEmptyTaskPayload(bootstrap),
    actualHours: 2,
  };

  return renderToStaticMarkup(
    React.createElement(TaskEditorModal, {
      activeTask: null,
      bootstrap,
      closeTaskModal: jest.fn(),
      disciplinesById: Object.fromEntries(
        bootstrap.disciplines.map((discipline) => [discipline.id, discipline]),
      ),
      eventsById: {},
      handleTaskSubmit: jest.fn(),
      isSavingTask: false,
      mechanismsById: {},
      mentors: bootstrap.members.filter((member) => member.role === "mentor"),
      partDefinitionsById: {},
      partInstancesById: {},
      students: bootstrap.members.filter((member) => member.role !== "mentor"),
      taskDraft,
      taskDraftBlockers: "",
      taskModalMode,
      setTaskDraft: jest.fn(),
      setTaskDraftBlockers: jest.fn(),
    }),
  );
}

describe("TaskEditorModal", () => {
  it("hides actual hours while creating a task", () => {
    expect(renderTaskModal("create")).not.toContain("Actual hours");
  });

  it("keeps actual hours visible while editing a task", () => {
    expect(renderTaskModal("edit")).toContain("Actual hours");
  });

  it("omits task traceability text", () => {
    expect(renderTaskModal("create")).not.toContain("Task traceability");
    expect(renderTaskModal("edit")).not.toContain("Task traceability");
  });
});
