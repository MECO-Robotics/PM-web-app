import type {
  InteractiveTutorialChapter,
  InteractiveTutorialStep,
} from "@/app/interactiveTutorial/interactiveTutorialTypes";

const outreachSteps = [
  {
    id: "project-outreach",
    title: "Switch project to Outreach",
    instruction: "Use the project dropdown and switch to Outreach.",
    selector: '[data-tutorial-target="project-select"]',
  },
  {
    id: "workflow-tab",
    title: "Open Workflow",
    instruction: "Open Workflow from the sidebar in Outreach mode.",
    selector: '[data-tutorial-target="sidebar-tab-subsystems"]',
  },
  {
    id: "workflow-edit",
    title: "Edit a workflow row",
    instruction: "Click a workflow row to open the edit modal.",
    selector: '[data-tutorial-target="edit-workflow-row"]',
  },
  {
    id: "inventory-tab",
    title: "Open Inventory",
    instruction: "Open Inventory from the sidebar.",
    selector: '[data-tutorial-target="sidebar-tab-inventory"]',
  },
  {
    id: "inventory-materials",
    title: "Open Documents",
    instruction: "Switch Inventory to Documents.",
    selector: '[data-tutorial-target="inventory-view-materials"]',
  },
  {
    id: "create-document",
    title: "Add a dummy document",
    instruction: "Use Add and save one document artifact.",
    selector: '[data-tutorial-target="create-document-button"]',
  },
  {
    id: "help-tab",
    title: "Finish on Help",
    instruction: "Open Help to complete the tutorial.",
    selector: '[data-tutorial-target="sidebar-tab-help"]',
  },
] satisfies InteractiveTutorialStep[];

export const outreachChapter = {
  id: "outreach",
  title: "Chapter 3: Outreach Workflow",
  summary: "Switch to Outreach, edit workflow, and add a document.",
  preferredProjectType: "outreach",
  steps: outreachSteps,
} satisfies InteractiveTutorialChapter;
