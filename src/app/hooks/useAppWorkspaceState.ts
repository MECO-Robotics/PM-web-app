// @ts-nocheck
import { useRef, useState } from "react";

import "@/app/App.css";
import { useAppAuth } from "@/app/hooks/useAppAuth";
import { useAppShell } from "@/app/hooks/useAppShell";
import { useAppWorkspaceGlobalEffects } from "@/app/hooks/useAppWorkspaceGlobalEffects";
import { useAppWorkspaceUiState } from "@/app/hooks/useAppWorkspaceUiState";
import { EMPTY_BOOTSTRAP } from "@/features/workspace/shared/model";
import type {
  InventoryViewTab,
  ManufacturingViewTab,
  RiskManagementViewTab,
  ReportsViewTab,
  TaskViewTab,
  ViewTab,
  WorklogsViewTab,
} from "@/lib/workspaceNavigation";
import type { BootstrapPayload } from "@/types";

export type AppWorkspaceState = ReturnType<typeof useAppWorkspaceState>;

export function useAppWorkspaceState() {
  const [activeTab, setActiveTab] = useState<ViewTab>("tasks");
  const [tabSwitchDirection, setTabSwitchDirection] = useState<"up" | "down">("down");
  const [taskView, setTaskView] = useState<TaskViewTab>("timeline");
  const [riskManagementView, setRiskManagementView] =
    useState<RiskManagementViewTab>("kanban");
  const [worklogsView, setWorklogsView] = useState<WorklogsViewTab>("logs");
  const [reportsView, setReportsView] = useState<ReportsViewTab>("qa");
  const [manufacturingView, setManufacturingView] =
    useState<ManufacturingViewTab>("cnc");
  const [inventoryView, setInventoryView] = useState<InventoryViewTab>("materials");
  const [bootstrap, setBootstrap] = useState<BootstrapPayload>(EMPTY_BOOTSTRAP);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [taskEditNotice, setTaskEditNotice] = useState<string | null>(null);

  const {
    isDarkMode,
    isSidebarCollapsed,
    isSidebarOverlay,
    pageShellStyle,
    toggleDarkMode,
    toggleSidebar,
  } = useAppShell();
  const workspaceUiState = useAppWorkspaceUiState();
  const suppressNextAutoWorkspaceLoadRef = useRef(false);

  const { authBooting, authConfig, authMessage, clearAuthMessage, enforcedAuthConfig, expireSession, googleButtonRef, handleSignOut, handleDevBypassSignIn, handleRequestEmailCode, handleVerifyEmailCode, isEmailAuthAvailable, isGoogleAuthAvailable, isSigningIn, sessionUser } =
    useAppAuth({
      isDarkMode,
      resetWorkspace: () => {
        setBootstrap(EMPTY_BOOTSTRAP);
        workspaceUiState.setActivePersonFilter([]);
        workspaceUiState.setSelectedSeasonId(null);
        workspaceUiState.setSelectedProjectId(null);
        workspaceUiState.setSelectedMemberId(null);
        workspaceUiState.setMemberEditDraft(null);
        setDataMessage(null);
      },
    });

  useAppWorkspaceGlobalEffects({
    isDarkMode,
    pageShellStyle,
    taskEditNotice,
    setTaskEditNotice,
    isSidebarOverlay,
    toggleSidebar,
    isAddSeasonPopupOpen: workspaceUiState.isAddSeasonPopupOpen,
    setIsAddSeasonPopupOpen: workspaceUiState.setIsAddSeasonPopupOpen,
    robotProjectModalMode: workspaceUiState.robotProjectModalMode,
    setRobotProjectModalMode: workspaceUiState.setRobotProjectModalMode,
  });

  return {
    ...workspaceUiState,
    activeTab,
    authBooting,
    authConfig,
    authMessage,
    bootstrap,
    clearAuthMessage,
    dataMessage,
    expireSession,
    googleButtonRef,
    handleDevBypassSignIn,
    handleRequestEmailCode,
    handleSignOut,
    handleVerifyEmailCode,
    inventoryView,
    isDarkMode,
    isEmailAuthAvailable,
    isGoogleAuthAvailable,
    isLoadingData,
    isSigningIn,
    isSidebarCollapsed,
    isSidebarOverlay,
    manufacturingView,
    pageShellStyle,
    reportsView,
    riskManagementView,
    setActiveTab,
    setBootstrap,
    setDataMessage,
    setInventoryView,
    setIsLoadingData,
    setManufacturingView,
    setReportsView,
    setRiskManagementView,
    setTabSwitchDirection,
    setTaskEditNotice,
    setTaskView,
    setWorklogsView,
    sessionUser,
    tabSwitchDirection,
    taskEditNotice,
    taskView,
    toggleDarkMode,
    toggleSidebar,
    worklogsView,
    suppressNextAutoWorkspaceLoadRef,
    enforcedAuthConfig,
  };
}

