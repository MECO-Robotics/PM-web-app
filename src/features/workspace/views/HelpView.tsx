import { useCallback, useEffect, useRef, useState } from "react";

import { IconChevronLeft, IconChevronRight, IconHelp } from "@/components/shared";
import { WORKSPACE_PANEL_CLASS } from "@/features/workspace/shared";

const HELP_SECTIONS: Array<{ title: string; items: string[] }> = [
  {
    title: "Navigate the workspace",
    items: [
      "Use the sidebar tabs to switch between planning, inventory, manufacturing, roster, and help.",
      "Use the season selector in the sidebar and the project selector in the top bar to scope what you are viewing.",
      "Use the top bar subtabs when available (for example Timeline, Queue, Milestones) to drill into each area.",
      "Use All projects in the top bar when you need a cross-project planning view.",
      "Use a specific project when you need detailed workflow, inventory, and manufacturing context.",
    ],
  },
  {
    title: "Understand tab behavior",
    items: [
      "Tasks always include Timeline, Queue, and Milestones for planning and execution.",
      "Manufacturing appears only when a robot project is selected and separates work into CNC, prints, and fabrication queues.",
      "Inventory changes by project type: robot projects show Materials, Parts, and Purchases, while non-robot projects show Documents and Purchases.",
      "Subsystems is relabeled as Workflow for non-robot projects.",
      "Roster and Help stay available in all project scopes.",
    ],
  },
  {
    title: "Create and edit records",
    items: [
      "Use Add buttons in each tab to create new entries.",
      "Click a row or card to edit it, and look for the pencil hover cue as a visual indicator.",
      "Use the edit dialog for updates and destructive actions so changes stay in one place.",
      "If a create action is disabled, check that a project or season is selected first.",
      "Use edit modals to update status, ownership, part links, and schedule dates.",
    ],
  },
  {
    title: "Filter and review data",
    items: [
      "Use search and filter controls in the toolbar to narrow results quickly.",
      "Use the refresh button in the top-right corner after external updates.",
      "Use the timeline and milestone tools to track deadlines and dependencies by subsystem.",
      "Use person filtering to focus on one or more members or switch back to all contributors.",
      "Review status chips, sidebar counts, and row badges to spot blocked, overdue, or role-specific work.",
    ],
  },
  {
    title: "Roster and access",
    items: [
      "Roster separates Students, Mentors, and External access so team contributors and outside viewers stay distinct.",
      "Click a person to make them the active workspace filter where that view supports person-scoped data.",
      "Use the add and edit popups to update emails, roles, and elevated mentor access without leaving the roster.",
    ],
  },
  {
    title: "Authentication and access",
    items: [
      "The sign-in screen is driven by server configuration and may show Google, email-code, or local dev access options.",
      "Google sign-in requires localhost or HTTPS and a matching authorized origin in Google Cloud.",
      "Email-code sign-in requires a valid team address and the one-time code from your inbox.",
      "If your session expires, sign in again and refresh the workspace to reload scoped data.",
    ],
  },
  {
    title: "Quick troubleshooting",
    items: [
      "If data looks missing, verify the selected season and project scope first.",
      "If actions fail to save, refresh the workspace and retry once before editing more records.",
      "If you cannot sign in, check backend availability and auth configuration.",
      "If filters seem stuck, clear search/filter inputs and switch tabs once to reset view state.",
    ],
  },
];

const HELP_TUTORIAL_STEPS: Array<{
  title: string;
  summary: string;
  actions: string[];
  cue: string;
}> = [
  {
    title: "Choose season and project scope",
    summary:
      "Start every workflow by checking the season selector and top-bar project scope so the records you create land in the right place.",
    actions: [
      "Open the sidebar season selector and confirm the active season.",
      "Use the top-bar project selector for robot, outreach, operations, or All projects.",
      "Switch to All projects only when you need a cross-project planning view.",
    ],
    cue: "Most missing-data reports come from being in the wrong season or project scope.",
  },
  {
    title: "Read the workspace shell",
    summary:
      "Use the sidebar for major areas and the top-bar subtabs for the specific workflow inside each area.",
    actions: [
      "Open Tasks, then move between Timeline, Queue, and Milestones.",
      "Open Inventory and compare how robot and non-robot projects change its subtabs.",
      "Look for footer notes at the bottom of each view for view-specific interaction cues.",
    ],
    cue: "Subtabs keep related workflows together without making the sidebar carry every detail view.",
  },
  {
    title: "Create and edit records",
    summary:
      "Most workspace data follows the same loop: Add from the toolbar, then click rows or cards later to edit them.",
    actions: [
      "Use Add buttons in task, inventory, manufacturing, roster, and workflow views.",
      "Hover rows or cards to find the pencil cue, then click the row or card itself.",
      "Use edit dialogs for updates and destructive actions instead of hunting for separate delete buttons.",
    ],
    cue: "If an Add button is disabled, verify that a season and valid project scope are selected.",
  },
  {
    title: "Filter the work",
    summary:
      "Search, dropdown filters, person filters, and status chips are designed to reduce a view without losing context.",
    actions: [
      "Use toolbar search first when you know a title, owner, vendor, or material.",
      "Stack dropdown filters when you need to narrow status, subsystem, requester, or approval.",
      "Select a roster person to keep person-scoped views aligned across tabs.",
    ],
    cue: "Clear filters before switching context if a list looks unexpectedly empty.",
  },
  {
    title: "Use roster and access",
    summary:
      "Roster is both a people list and a filter source for planning, ownership, and access-aware views.",
    actions: [
      "Use Students, Mentors, and External access as separate roster groups.",
      "Click a member name to make them the active person filter where supported.",
      "Use roster popups to maintain email, role, and elevated lead/core mentor status.",
    ],
    cue: "Lead and core mentor badges are compact row-end role markers, not separate columns.",
  },
  {
    title: "Recover from stale state",
    summary:
      "When something looks off, reset the smallest likely source before changing more records.",
    actions: [
      "Clear search and filters, then switch tabs once if a list seems stuck.",
      "Use the refresh control after another device or user changes shared data.",
      "If saving fails, refresh workspace data and retry once before continuing edits.",
    ],
    cue: "Scope, filters, and stale data explain most confusing workspace states.",
  },
];

interface HelpViewProps {
  tutorialInitiallyOpen?: boolean;
}

export function HelpView({ tutorialInitiallyOpen = false }: HelpViewProps) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(tutorialInitiallyOpen);
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);
  const closeTutorialButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    setActiveTutorialStep(0);
  }, []);

  const openTutorial = () => {
    setActiveTutorialStep(0);
    setIsTutorialOpen(true);
  };

  useEffect(() => {
    if (!isTutorialOpen) {
      return;
    }

    closeTutorialButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTutorial();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTutorial, isTutorialOpen]);

  const currentStep = HELP_TUTORIAL_STEPS[activeTutorialStep] ?? HELP_TUTORIAL_STEPS[0];
  const isLastStep = activeTutorialStep === HELP_TUTORIAL_STEPS.length - 1;
  const progressPercent = ((activeTutorialStep + 1) / HELP_TUTORIAL_STEPS.length) * 100;

  const goToPreviousStep = () => {
    setActiveTutorialStep((current) => Math.max(0, current - 1));
  };

  const goToNextStep = () => {
    if (isLastStep) {
      closeTutorial();
      return;
    }

    setActiveTutorialStep((current) =>
      Math.min(HELP_TUTORIAL_STEPS.length - 1, current + 1),
    );
  };

  return (
    <section className={`panel dense-panel help-page ${WORKSPACE_PANEL_CLASS}`}>
      <div className="panel-header compact-header">
        <div className="queue-section-header">
          <h2>Help documentation</h2>
          <p className="section-copy">
            Detailed reference for navigation, editing, auth, and troubleshooting workflows.
          </p>
        </div>
        <button
          aria-controls="help-tutorial-dialog"
          className="primary-action help-tutorial-launch"
          data-tutorial-launch="help"
          onClick={openTutorial}
          type="button"
        >
          <IconHelp />
          Start tutorial
        </button>
      </div>

      <div className="panel-subsection help-docs-list">
        {HELP_SECTIONS.map((section) => (
          <article className="help-doc-section" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {isTutorialOpen ? (
        <div
          className="modal-scrim help-tutorial-scrim"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeTutorial();
            }
          }}
          role="presentation"
        >
          <section
            aria-describedby="help-tutorial-description"
            aria-labelledby="help-tutorial-title"
            aria-modal="true"
            className="modal-card help-tutorial-modal"
            id="help-tutorial-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="panel-header compact-header help-tutorial-modal-header">
              <div className="queue-section-header">
                <p className="eyebrow">Interactive walkthrough</p>
                <h2 id="help-tutorial-title">Guided workspace tutorial</h2>
                <p className="section-copy" id="help-tutorial-description">
                  Move through the common workspace loop without leaving this Help page.
                </p>
              </div>
              <button
                ref={closeTutorialButtonRef}
                className="icon-button"
                onClick={closeTutorial}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="help-tutorial-progress" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="help-tutorial-layout">
              <ol className="help-tutorial-step-list" aria-label="Tutorial steps">
                {HELP_TUTORIAL_STEPS.map((step, index) => {
                  const stepNumber = index + 1;
                  const isActive = index === activeTutorialStep;

                  return (
                    <li key={step.title}>
                      <button
                        aria-current={isActive ? "step" : undefined}
                        className="help-tutorial-step-button"
                        data-active={isActive}
                        onClick={() => setActiveTutorialStep(index)}
                        type="button"
                      >
                        <span className="help-tutorial-step-number">{stepNumber}</span>
                        <span>{step.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <article className="help-tutorial-step-card">
                <p className="eyebrow">
                  Step {activeTutorialStep + 1} of {HELP_TUTORIAL_STEPS.length}
                </p>
                <h3>{currentStep.title}</h3>
                <p>{currentStep.summary}</p>
                <ul>
                  {currentStep.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <div className="help-tutorial-cue">
                  <span>Workspace cue</span>
                  <p>{currentStep.cue}</p>
                </div>
              </article>
            </div>

            <div className="modal-actions help-tutorial-actions">
              <button
                className="secondary-action"
                disabled={activeTutorialStep === 0}
                onClick={goToPreviousStep}
                type="button"
              >
                <IconChevronLeft />
                Back
              </button>
              <button className="secondary-action" onClick={closeTutorial} type="button">
                Finish tutorial
              </button>
              <button className="primary-action" onClick={goToNextStep} type="button">
                {isLastStep ? "Done" : "Next"}
                {!isLastStep ? <IconChevronRight /> : null}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
