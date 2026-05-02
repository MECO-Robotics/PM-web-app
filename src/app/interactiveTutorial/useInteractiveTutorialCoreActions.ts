import { startTransition, useCallback } from "react";

import { fetchBootstrap, resetInteractiveTutorialSession, startInteractiveTutorialSession } from "@/lib/auth";
import { toErrorMessage } from "@/lib/appUtils";
import type { BootstrapPayload } from "@/types";

import { getInteractiveTutorialCreationCounts } from "./interactiveTutorialHelpers";
import {
  buildInteractiveTutorialReturnState,
  getInteractiveTutorialChapter,
  resolveInteractiveTutorialSandboxSelection,
} from "./interactiveTutorialSessionHelpers";
import type { InteractiveTutorialCoreState } from "./useInteractiveTutorialCoreState";
import type { UseInteractiveTutorialOptions } from "./useInteractiveTutorialCoreTypes";

export function useInteractiveTutorialCoreActions(
  options: UseInteractiveTutorialOptions,
  state: InteractiveTutorialCoreState,
) {
  const {
    activeTab,
    taskView,
    riskManagementView,
    worklogsView,
    reportsView,
    manufacturingView,
    inventoryView,
    selectedSeasonId,
    selectedProjectId,
    bootstrap,
    isSidebarCollapsed,
    toggleSidebar,
    closeSidebarOverlay,
    handleUnauthorized,
    setActiveTab,
    setTaskView,
    setRiskManagementView,
    setWorklogsView,
    setReportsView,
    setManufacturingView,
    setInventoryView,
    setSelectedSeasonId,
    setSelectedProjectId,
    setActivePersonFilter,
    setBootstrap,
    setDataMessage,
  } = options;

  const {
    activeChapter,
    bootstrapSnapshot,
    chapters,
    nextChapterId,
    resetLocalTutorialState,
    returnState,
    setBaselineCounts,
    setBootstrapSnapshot,
    setChapterId,
    setCompletedChapterId,
    setCompletedChapters,
    setReturnState,
    setStepIndex,
    setTutorialProjectId,
    setTutorialProjectName,
    setTutorialSeasonId,
    setTutorialSeasonName,
    stepIndex,
    steps,
  } = state;

  const closeInteractiveTutorial = useCallback(async () => {
    const previousState = returnState;
    const previousBootstrap = bootstrapSnapshot;

    resetLocalTutorialState();

    if (previousBootstrap) {
      startTransition(() => {
        setBootstrap(previousBootstrap);
      });
    }

    if (previousState) {
      setActiveTab(previousState.activeTab);
      setTaskView(previousState.taskView);
      setRiskManagementView(previousState.riskManagementView);
      setWorklogsView(previousState.worklogsView);
      setReportsView(previousState.reportsView);
      setManufacturingView(previousState.manufacturingView);
      setInventoryView(previousState.inventoryView);
      setSelectedSeasonId(previousState.selectedSeasonId);
      setSelectedProjectId(previousState.selectedProjectId);
    }

    setReturnState(null);

    try {
      await resetInteractiveTutorialSession(handleUnauthorized);
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    }
  }, [
    bootstrapSnapshot,
    handleUnauthorized,
    resetLocalTutorialState,
    returnState,
    setActiveTab,
    setBootstrap,
    setDataMessage,
    setInventoryView,
    setManufacturingView,
    setReportsView,
    setRiskManagementView,
    setSelectedProjectId,
    setSelectedSeasonId,
    setReturnState,
    setTaskView,
    setWorklogsView,
  ]);

  const advanceInteractiveTutorial = useCallback(() => {
    if (stepIndex === null) {
      return;
    }

    if (stepIndex >= steps.length - 1) {
      if (activeChapter) {
        setCompletedChapterId(activeChapter.id);
        setCompletedChapters((current) =>
          current.includes(activeChapter.id) ? current : [...current, activeChapter.id],
        );
      }
      setStepIndex(null);
      return;
    }

    setStepIndex(stepIndex + 1);
  }, [activeChapter, setCompletedChapterId, setCompletedChapters, setStepIndex, stepIndex, steps.length]);

  const startInteractiveTutorial = useCallback(
    async (requestedChapterId: string = "planning") => {
      if (stepIndex !== null) {
        return;
      }

      const chapter = getInteractiveTutorialChapter(chapters, requestedChapterId);
      if (!chapter || chapter.steps.length === 0) {
        setDataMessage("Interactive tutorial chapter is unavailable right now.");
        return;
      }

      if (!returnState) {
        setReturnState(
          buildInteractiveTutorialReturnState({
            activeTab,
            taskView,
            riskManagementView,
            worklogsView,
            reportsView,
            manufacturingView,
            inventoryView,
            selectedSeasonId,
            selectedProjectId,
          }),
        );
      }
      if (!bootstrapSnapshot) {
        setBootstrapSnapshot(structuredClone(bootstrap));
      }

      setDataMessage(null);
      try {
        if (!returnState) {
          await startInteractiveTutorialSession(handleUnauthorized);
        }
        await resetInteractiveTutorialSession(handleUnauthorized, "baseline");
      } catch (error) {
        setDataMessage(toErrorMessage(error));
        return;
      }

      let tutorialBootstrap: BootstrapPayload;
      try {
        tutorialBootstrap = await fetchBootstrap(undefined, undefined, undefined, handleUnauthorized);
      } catch (error) {
        setDataMessage(toErrorMessage(error));
        return;
      }

      startTransition(() => {
        setBootstrap(tutorialBootstrap);
      });
      setActivePersonFilter([]);

      const sandboxSelection = resolveInteractiveTutorialSandboxSelection(
        tutorialBootstrap,
        chapter.preferredProjectType,
      );

      if (sandboxSelection.tutorialSeasonId) {
        setSelectedSeasonId(
          chapter.id === "planning"
            ? sandboxSelection.nonTutorialSeasonId ?? sandboxSelection.tutorialSeasonId
            : sandboxSelection.tutorialSeasonId,
        );
        setTutorialSeasonId(sandboxSelection.tutorialSeasonId);
        setTutorialSeasonName(
          `${sandboxSelection.tutorialSeason?.name ?? "Tutorial season"} (fake sandbox)`,
        );
      } else {
        setSelectedSeasonId(null);
        setTutorialSeasonId(null);
        setTutorialSeasonName("Tutorial season (fake sandbox)");
      }

      if (sandboxSelection.tutorialProject) {
        if (chapter.id === "planning") {
          setSelectedProjectId(null);
        } else if (chapter.id === "outreach") {
          setSelectedProjectId(sandboxSelection.projectToForceOutreachSwitch?.id ?? null);
        } else {
          setSelectedProjectId(sandboxSelection.tutorialProject.id);
        }
        setTutorialProjectId(sandboxSelection.tutorialProject.id);
        setTutorialProjectName(sandboxSelection.tutorialProject.name);
      } else {
        setSelectedProjectId(null);
        setTutorialProjectId(null);
        setTutorialProjectName(null);
      }

      setBaselineCounts(
        getInteractiveTutorialCreationCounts(
          tutorialBootstrap,
          sandboxSelection.tutorialProjectId,
          sandboxSelection.tutorialSeasonId,
        ),
      );
      setCompletedChapterId(null);
      setChapterId(chapter.id);
      setActiveTab("tasks");
      setTaskView("timeline");
      setRiskManagementView("kanban");
      setWorklogsView("logs");
      setReportsView("qa");
      setManufacturingView("cnc");
      setInventoryView("materials");
      setStepIndex(0);

      if (isSidebarCollapsed) {
        toggleSidebar();
      }
      closeSidebarOverlay();
    },
    [
      activeTab,
      bootstrap,
      bootstrapSnapshot,
      chapters,
      closeSidebarOverlay,
      handleUnauthorized,
      inventoryView,
      isSidebarCollapsed,
      manufacturingView,
      riskManagementView,
      reportsView,
      returnState,
      selectedProjectId,
      selectedSeasonId,
      setActivePersonFilter,
      setActiveTab,
      setBaselineCounts,
      setBootstrap,
      setBootstrapSnapshot,
      setChapterId,
      setCompletedChapterId,
      setDataMessage,
      setInventoryView,
      setManufacturingView,
      setReportsView,
      setRiskManagementView,
      setSelectedProjectId,
      setSelectedSeasonId,
      setReturnState,
      setStepIndex,
      setTaskView,
      setTutorialProjectId,
      setTutorialProjectName,
      setTutorialSeasonId,
      setTutorialSeasonName,
      setWorklogsView,
      stepIndex,
      taskView,
      toggleSidebar,
      worklogsView,
    ],
  );

  const continueInteractiveTutorialToNextChapter = useCallback(() => {
    if (!nextChapterId) {
      void closeInteractiveTutorial();
      return;
    }

    void startInteractiveTutorial(nextChapterId);
  }, [closeInteractiveTutorial, nextChapterId, startInteractiveTutorial]);

  return {
    advanceInteractiveTutorial,
    closeInteractiveTutorial,
    continueInteractiveTutorialToNextChapter,
    startInteractiveTutorial,
  };
}
