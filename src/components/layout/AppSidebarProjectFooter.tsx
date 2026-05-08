import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import { LayoutGrid, Plus } from "lucide-react";

import { IconChevronRight, IconEdit, IconHelp } from "@/components/shared/Icons";
import type { ProjectRecord } from "@/types/recordsOrganization";
import { getProjectIcon, getProjectIconColor } from "./appSidebarIcons";

interface AppSidebarProjectFooterProps {
  activeTab: import("@/lib/workspaceNavigation").ViewTab;
  canEditSelectedRobot: boolean;
  isCollapsed: boolean;
  isProjectPopupOpen: boolean;
  onEditSelectedRobot: () => void;
  onHelpSelect: () => void;
  onProjectTriggerClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onSelectProjectOption: (value: string) => void;
  projectPopupRef: RefObject<HTMLDivElement | null>;
  projectPopupTop: number;
  projectTriggerRef: RefObject<HTMLButtonElement | null>;
  projects: ProjectRecord[];
  selectedProject: ProjectRecord | null;
  selectedProjectId: string | null;
  selectedProjectLabel: string;
}

const ADD_ROBOT_PROJECT_VALUE = "__add_robot_project__";

export function AppSidebarProjectFooter({
  activeTab,
  canEditSelectedRobot,
  isCollapsed,
  isProjectPopupOpen,
  onEditSelectedRobot,
  onHelpSelect,
  onProjectTriggerClick,
  onSelectProjectOption,
  projectPopupRef,
  projectPopupTop,
  projectTriggerRef,
  projects,
  selectedProject,
  selectedProjectId,
  selectedProjectLabel,
}: AppSidebarProjectFooterProps) {
  const renderProjectOption = (
    label: string,
    icon: ReactNode,
    iconColor: string,
    isActive: boolean,
    value: string,
    key: string,
  ) => (
    <button
      className="sidebar-project-option"
      data-active={isActive ? "true" : "false"}
      key={key}
      onClick={() => onSelectProjectOption(value)}
      type="button"
    >
      <span aria-hidden="true" className="sidebar-project-option-icon" style={{ color: iconColor }}>
        {icon}
      </span>
      <span className="sidebar-project-option-label">{label}</span>
    </button>
  );

  const projectOptionsContent = (
    <>
      {projects.length === 0 ? (
        <button className="sidebar-project-option" disabled type="button">
          No projects
        </button>
      ) : (
        <>
          {renderProjectOption(
            "All projects",
            <LayoutGrid size={14} strokeWidth={2} />,
            "var(--official-blue)",
            selectedProjectId === null,
            "",
            "all-projects",
          )}
          {projects.map((project) =>
            renderProjectOption(
              project.name,
              getProjectIcon(project),
              getProjectIconColor(project),
              selectedProjectId === project.id,
              project.id,
              project.id,
            ),
          )}
        </>
      )}
      {renderProjectOption(
        "Add robot",
        <Plus size={14} strokeWidth={2} />,
        "var(--meco-blue)",
        false,
        ADD_ROBOT_PROJECT_VALUE,
        ADD_ROBOT_PROJECT_VALUE,
      )}
    </>
  );

  return (
    <>
      {!isCollapsed ? (
        <div className="sidebar-footer-stack">
          <button
            className="tab sidebar-footer-help-button"
            data-active={activeTab === "help" ? "true" : "false"}
            onClick={onHelpSelect}
            type="button"
          >
            <span className="sidebar-tab-main">
              <span aria-hidden="true" className="sidebar-tab-icon">
                <IconHelp />
              </span>
              <span className="sidebar-tab-label">Help</span>
            </span>
          </button>
          <div className="sidebar-context-picker sidebar-project-picker">
            <span className="sidebar-context-label">Project</span>
            <div className="sidebar-project-compact-row" data-tutorial-target="project-select-outreach">
              <button
                aria-expanded={isProjectPopupOpen ? "true" : "false"}
                aria-label="Select project"
                className="sidebar-project-trigger"
                data-tutorial-target="project-select"
                onClick={onProjectTriggerClick}
                ref={projectTriggerRef}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="sidebar-tab-icon"
                  style={{ color: getProjectIconColor(selectedProject) }}
                >
                  {getProjectIcon(selectedProject)}
                </span>
                <span className="sidebar-project-trigger-label">{selectedProjectLabel}</span>
                <span
                  aria-hidden="true"
                  className={`sidebar-project-trigger-chevron${isProjectPopupOpen ? " is-open" : ""}`}
                >
                  <IconChevronRight />
                </span>
              </button>
              {canEditSelectedRobot ? (
                <button
                  aria-label="Edit robot name"
                  className="sidebar-context-action"
                  onClick={onEditSelectedRobot}
                  title="Edit robot name"
                  type="button"
                >
                  <IconEdit />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="sidebar-footer-stack sidebar-footer-stack-collapsed">
          <button
            aria-label="Help"
            className="tab sidebar-help-collapsed-trigger"
            data-active={activeTab === "help" ? "true" : "false"}
            onClick={onHelpSelect}
            type="button"
          >
            <span className="sidebar-tab-main">
              <span aria-hidden="true" className="sidebar-tab-icon">
                <IconHelp />
              </span>
            </span>
          </button>
          <div className="sidebar-project-collapsed-slot">
            <button
              aria-expanded={isProjectPopupOpen ? "true" : "false"}
              aria-label="Select project"
              className="tab sidebar-project-collapsed-trigger"
              data-tutorial-target="project-select"
              onClick={onProjectTriggerClick}
              ref={projectTriggerRef}
              type="button"
            >
              <span className="sidebar-tab-main">
                <span
                  aria-hidden="true"
                  className="sidebar-tab-icon"
                  style={{ color: getProjectIconColor(selectedProject) }}
                >
                  {getProjectIcon(selectedProject)}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {isProjectPopupOpen ? (
        <div
          className="sidebar-compact-popup sidebar-project-compact-popup"
          ref={projectPopupRef}
          style={{ top: `${projectPopupTop}px` }}
        >
          <p className="sidebar-compact-popup-title">Project</p>
          {projectOptionsContent}
        </div>
      ) : null}
    </>
  );
}

export { ADD_ROBOT_PROJECT_VALUE };
