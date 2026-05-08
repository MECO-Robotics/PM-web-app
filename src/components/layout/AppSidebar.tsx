import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  type InventoryViewTab,
  type NavigationSection,
  type NavigationSubItemId,
  type NavigationTarget,
  NAVIGATION_SECTION_ORDER,
  NAVIGATION_SUB_ITEMS,
  NAVIGATION_SUB_ITEMS_BY_SECTION,
  getActiveNavigationSubItemId,
  getNavigationSectionFromSubItem,
  type ReportsViewTab,
  type RosterViewTab,
  type RiskManagementViewTab,
  type TaskViewTab,
  type ViewTab,
  type WorklogsViewTab,
} from "@/lib/workspaceNavigation";
import type { ProjectRecord } from "@/types/recordsOrganization";
import { IconChevronLeft, IconChevronRight } from "@/components/shared/Icons";

import { AppSidebarProjectFooter, ADD_ROBOT_PROJECT_VALUE } from "./AppSidebarProjectFooter";
import { AppSidebarSections, type SidebarSubItemModel } from "./AppSidebarSections";

const POPUP_VERTICAL_MARGIN = 8;

function clampPopupTop(
  shellElement: HTMLDivElement | null,
  popupElement: HTMLDivElement | null,
  preferredTop: number,
) {
  if (!shellElement || !popupElement) {
    return preferredTop;
  }

  const shellHeight = shellElement.getBoundingClientRect().height;
  const popupHeight = popupElement.getBoundingClientRect().height;
  const minimumTop = POPUP_VERTICAL_MARGIN;
  const maximumTop = Math.max(minimumTop, shellHeight - popupHeight - POPUP_VERTICAL_MARGIN);

  return Math.min(Math.max(preferredTop, minimumTop), maximumTop);
}

interface AppSidebarProps {
  activeTab: ViewTab;
  items: import("@/lib/workspaceNavigation").NavigationItem[];
  onSelectTarget: (target: NavigationTarget, options?: { keepSidebarOpen?: boolean }) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  projects: ProjectRecord[];
  selectedProjectId: string | null;
  inventoryView: InventoryViewTab;
  reportsView: ReportsViewTab;
  rosterView: RosterViewTab;
  riskManagementView: RiskManagementViewTab;
  taskView: TaskViewTab;
  worklogsView: WorklogsViewTab;
  onSelectProject: (projectId: string | null) => void;
  onCreateRobot: () => void;
  onEditSelectedRobot: () => void;
}

export function AppSidebar({
  activeTab,
  items,
  onSelectTarget,
  isCollapsed,
  toggleSidebar,
  projects,
  selectedProjectId,
  inventoryView,
  reportsView,
  rosterView,
  riskManagementView,
  taskView,
  worklogsView,
  onSelectProject,
  onCreateRobot,
  onEditSelectedRobot,
}: AppSidebarProps) {
  const sidebarShellRef = useRef<HTMLDivElement | null>(null);
  const compactPopupRef = useRef<HTMLDivElement | null>(null);
  const projectPopupRef = useRef<HTMLDivElement | null>(null);
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const isRobotProject = selectedProject?.projectType === "robot";
  const canEditSelectedRobot = selectedProject?.projectType === "robot";
  const selectedProjectLabel = selectedProject?.name ?? "All projects";

  const visibleTabs = useMemo(() => new Set(items.map((item) => item.value)), [items]);

  const activeSubItemId = getActiveNavigationSubItemId({
    activeTab,
    inventoryView,
    manufacturingView: "cnc",
    rosterView,
    reportsView,
    riskManagementView,
    taskView,
    worklogsView,
  });
  const activeSection = getNavigationSectionFromSubItem(activeSubItemId);

  const [expandedSection, setExpandedSection] = useState<NavigationSection>(activeSection);
  const [compactPopupSection, setCompactPopupSection] = useState<NavigationSection | null>(null);
  const [compactPopupTop, setCompactPopupTop] = useState(0);
  const [projectPopupTop, setProjectPopupTop] = useState(0);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);

  useEffect(() => {
    setExpandedSection(activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (!isCollapsed) {
      setCompactPopupSection(null);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if ((!isCollapsed || compactPopupSection === null) && !isProjectPopupOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target;
      if (!(targetNode instanceof Node)) {
        return;
      }

      if (compactPopupRef.current?.contains(targetNode)) {
        return;
      }

      if (projectPopupRef.current?.contains(targetNode)) {
        return;
      }

      if (projectTriggerRef.current?.contains(targetNode)) {
        return;
      }

      if (compactPopupSection !== null) {
        setCompactPopupSection(null);
      }

      if (isProjectPopupOpen) {
        setIsProjectPopupOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCompactPopupSection(null);
        setIsProjectPopupOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [compactPopupSection, isCollapsed, isProjectPopupOpen]);

  useEffect(() => {
    if (!isCollapsed || compactPopupSection === null) {
      return;
    }

    const clampedTop = clampPopupTop(
      sidebarShellRef.current,
      compactPopupRef.current,
      compactPopupTop,
    );

    if (Math.abs(clampedTop - compactPopupTop) > 0.5) {
      setCompactPopupTop(clampedTop);
    }
  }, [compactPopupSection, compactPopupTop, isCollapsed]);

  useEffect(() => {
    if (!isProjectPopupOpen) {
      return;
    }

    const clampedTop = clampPopupTop(sidebarShellRef.current, projectPopupRef.current, projectPopupTop);
    if (Math.abs(clampedTop - projectPopupTop) > 0.5) {
      setProjectPopupTop(clampedTop);
    }
  }, [isProjectPopupOpen, projectPopupTop]);

  const isSubItemEnabled = useCallback(
    (subItemId: NavigationSubItemId) => {
      const subItem = NAVIGATION_SUB_ITEMS.find((item) => item.id === subItemId);
      if (subItem && !visibleTabs.has(subItem.target.tab)) {
        return false;
      }

      if (subItemId === "config-robot-model" || subItemId === "config-part-mappings") {
        return isRobotProject;
      }

      if (subItemId === "inventory-parts") {
        return isRobotProject;
      }

      return true;
    },
    [isRobotProject, visibleTabs],
  );

  const getSectionSubItems = useCallback(
    (section: NavigationSection): SidebarSubItemModel[] =>
      NAVIGATION_SUB_ITEMS_BY_SECTION[section].map((subItem) => ({
        ...subItem,
        isEnabled: isSubItemEnabled(subItem.id),
      })),
    [isSubItemEnabled],
  );

  const sectionModels = useMemo(
    () =>
      NAVIGATION_SECTION_ORDER.map((section) => {
        const subItems = getSectionSubItems(section);
        return {
          section,
          subItems,
          isEnabled: subItems.some((subItem) => subItem.isEnabled),
        };
      }),
    [getSectionSubItems],
  );

  const handleSectionClick = (section: NavigationSection, event: ReactMouseEvent<HTMLButtonElement>) => {
    const subItems = getSectionSubItems(section);
    const firstEnabledSubItem = subItems.find((subItem) => subItem.isEnabled);

    if (isCollapsed) {
      const shellRect = sidebarShellRef.current?.getBoundingClientRect();
      const targetRect = event.currentTarget.getBoundingClientRect();
      const popupTop = shellRect ? targetRect.top - shellRect.top : 0;
      setCompactPopupTop(popupTop);
      setIsProjectPopupOpen(false);
      setCompactPopupSection((current) => (current === section ? null : section));
      return;
    }

    setExpandedSection(section);

    if (firstEnabledSubItem) {
      onSelectTarget(firstEnabledSubItem.target, { keepSidebarOpen: true });
    }
  };

  const handleSubItemSelect = (target: NavigationTarget, isEnabled: boolean) => {
    if (!isEnabled) {
      return;
    }

    onSelectTarget(target);
    setCompactPopupSection(null);
  };

  const handleProjectTriggerClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const shellRect = sidebarShellRef.current?.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();
    const popupTop = shellRect ? targetRect.top - shellRect.top : 0;
    setProjectPopupTop(popupTop);

    if (isCollapsed) {
      setCompactPopupSection(null);
    }

    setIsProjectPopupOpen((current) => !current);
  };

  const handleProjectOptionSelect = (value: string) => {
    if (value === ADD_ROBOT_PROJECT_VALUE) {
      onCreateRobot();
    } else {
      onSelectProject(value || null);
    }

    setIsProjectPopupOpen(false);
  };

  const handleHelpSelect = () => {
    setCompactPopupSection(null);
    setIsProjectPopupOpen(false);
    onSelectTarget({ tab: "help" }, { keepSidebarOpen: true });
  };

  return (
    <div className="sidebar-shell" data-collapsed={isCollapsed ? "true" : "false"} ref={sidebarShellRef}>
      <nav aria-label="Workspace views" className="sidebar" data-collapsed={isCollapsed ? "true" : "false"}>
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="tab"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          type="button"
        >
          <span className="sidebar-tab-main">
            <span aria-hidden="true" className="sidebar-tab-icon">
              {isCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
            </span>
            {!isCollapsed ? <span className="sidebar-tab-label">Collapse sidebar</span> : null}
          </span>
        </button>

        <AppSidebarSections
          activeSection={activeSection}
          activeSubItemId={activeSubItemId}
          compactPopupRef={compactPopupRef}
          compactPopupSection={compactPopupSection}
          compactPopupTop={compactPopupTop}
          expandedSection={expandedSection}
          getSectionSubItems={getSectionSubItems}
          isCollapsed={isCollapsed}
          onSectionClick={handleSectionClick}
          onSubItemSelect={handleSubItemSelect}
          sectionModels={sectionModels}
        />

        <AppSidebarProjectFooter
          activeTab={activeTab}
          canEditSelectedRobot={canEditSelectedRobot}
          isCollapsed={isCollapsed}
          isProjectPopupOpen={isProjectPopupOpen}
          onEditSelectedRobot={onEditSelectedRobot}
          onHelpSelect={handleHelpSelect}
          onProjectTriggerClick={handleProjectTriggerClick}
          onSelectProjectOption={handleProjectOptionSelect}
          projectPopupRef={projectPopupRef}
          projectPopupTop={projectPopupTop}
          projectTriggerRef={projectTriggerRef}
          projects={projects}
          selectedProject={selectedProject}
          selectedProjectId={selectedProjectId}
          selectedProjectLabel={selectedProjectLabel}
        />
      </nav>
    </div>
  );
}
