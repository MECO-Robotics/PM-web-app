/// <reference types="jest" />

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/lib/branding", () => ({
  MECO_MAIN_LOGO_HEIGHT: 40,
  MECO_MAIN_LOGO_LIGHT_SRC: "/logo-light.png",
  MECO_MAIN_LOGO_WHITE_SRC: "/logo-white.png",
  MECO_MAIN_LOGO_WIDTH: 120,
  MECO_PROFILE_AVATAR_SIZE: 32,
}));

import { AppTopbar } from "@/components/layout/AppTopbar";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function renderTopbar(
  isNonRobotProject: boolean,
  selectedProject: {
    id: string;
    name: string;
    projectType: "robot" | "operations";
  } = {
    id: "project-1",
    name: "Operations",
    projectType: "operations",
  },
  myView: {
    isActive: boolean;
    memberName: string | null;
  } = {
    isActive: false,
    memberName: "Ava Chen",
  },
  isSignedIn = false,
) {
  const sessionUser = isSignedIn
    ? {
        accountId: "account-1",
        authProvider: "google" as const,
        email: "ava.chen@example.com",
        hostedDomain: "meco-robotics.com",
        name: "Ava Chen",
        picture: null,
      }
    : null;

  return renderToStaticMarkup(
    React.createElement(AppTopbar, {
      activeTab: "inventory",
      handleSignOut: jest.fn(),
      inventoryView: "materials",
      isDarkMode: false,
      isLoadingData: false,
      isNonRobotProject,
      isSidebarCollapsed: false,
      loadWorkspace: jest.fn(),
      manufacturingView: "cnc",
      onCreateRobot: jest.fn(),
      onEditSelectedRobot: jest.fn(),
      onToggleMyView: jest.fn(),
      onSelectProject: jest.fn(),
      projects: [
        {
          id: selectedProject.id,
          seasonId: "season-1",
          name: selectedProject.name,
          projectType: selectedProject.projectType,
          description: "",
          status: "active",
        },
      ],
      selectedProjectId: selectedProject.id,
      sessionUser,
      isMyViewActive: myView.isActive,
      myViewMemberName: myView.memberName,
      setInventoryView: jest.fn(),
      setManufacturingView: jest.fn(),
      setTaskView: jest.fn(),
      setWorklogsView: jest.fn(),
      subsystemsLabel: "Workflow",
      taskView: "timeline",
      worklogsView: "logs",
      toggleDarkMode: jest.fn(),
      toggleSidebar: jest.fn(),
    }),
  );
}

describe("AppTopbar", () => {
  it("omits the non-technical inventory subtab for non-robot projects", () => {
    const markup = renderTopbar(true);

    expect(markup).toContain("Documents");
    expect(markup).toContain("Purchases");
    expect(markup).not.toContain("Non-Technical");
  });

  it("offers add robot from the project dropdown", () => {
    const markup = renderTopbar(false);

    expect(markup).toContain("Add robot");
  });

  it("shows an edit robot name button when a robot project is selected", () => {
    const markup = renderTopbar(false, {
      id: "project-robot",
      name: "Robot",
      projectType: "robot",
    });

    expect(markup).toContain("Edit robot name");
  });

  it("renders My View as an active topbar filter toggle", () => {
    const markup = renderTopbar(
      false,
      {
        id: "project-robot",
        name: "Robot",
        projectType: "robot",
      },
      {
        isActive: true,
        memberName: "Ava Chen",
      },
    );

    expect(markup).toContain('aria-label="Clear My View filter"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("Showing Ava Chen");
    expect(markup).not.toContain(">My View<");
  });

  it("keeps a standalone dark mode button for local access", () => {
    const markup = renderTopbar(false);

    expect(markup).toContain('aria-label="Toggle dark mode"');
  });

  it("moves dark mode toggle under profile menu for signed-in users", () => {
    const markup = renderTopbar(false, undefined, undefined, true);

    expect(markup).toContain("profile-menu-item-theme-toggle");
    expect(markup).toContain("Dark mode");
    expect(markup).not.toContain('aria-label="Toggle dark mode"');
  });
});
