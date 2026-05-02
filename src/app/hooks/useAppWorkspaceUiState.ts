import { useState } from "react";

import { EMPTY_BOOTSTRAP } from "@/features/workspace/shared/model";
import {
  buildEmptyArtifactPayload,
  buildEmptyMechanismPayload,
  buildEmptyManufacturingPayload,
  buildEmptyMaterialPayload,
  buildEmptyPartDefinitionPayload,
  buildEmptyPartInstancePayload,
  buildEmptyPurchasePayload,
  buildEmptyQaReportPayload,
  buildEmptyWorkLogPayload,
  buildEmptyTestResultPayload,
  buildEmptySubsystemPayload,
  buildEmptyTaskPayload,
  buildEmptyWorkstreamPayload,
} from "@/lib/appUtils";
import type {
  ArtifactPayload,
  ManufacturingItemPayload,
  MaterialPayload,
  MechanismPayload,
  MemberPayload,
  PartDefinitionPayload,
  PartInstancePayload,
  PurchaseItemPayload,
  QaReportPayload,
  SubsystemPayload,
  TaskPayload,
  TestResultPayload,
  WorkLogPayload,
  WorkstreamPayload,
} from "@/types";
import type {
  ArtifactModalMode,
  EventReportModalMode,
  ManufacturingModalMode,
  MaterialModalMode,
  MechanismModalMode,
  PartDefinitionModalMode,
  PartInstanceModalMode,
  PurchaseModalMode,
  QaReportModalMode,
  SubsystemModalMode,
  TaskModalMode,
  WorkLogModalMode,
  WorkstreamModalMode,
} from "@/features/workspace";
import type { FilterSelection } from "@/features/workspace/shared";

export function useAppWorkspaceUiState() {
  const [taskModalMode, setTaskModalMode] = useState<TaskModalMode>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTimelineTaskDetailId, setActiveTimelineTaskDetailId] = useState<string | null>(
    null,
  );
  const [taskDraft, setTaskDraft] = useState<TaskPayload>(
    buildEmptyTaskPayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [showTimelineCreateToggleInTaskModal, setShowTimelineCreateToggleInTaskModal] =
    useState(false);
  const [timelineMilestoneCreateSignal, setTimelineMilestoneCreateSignal] = useState(0);

  const [workLogModalMode, setWorkLogModalMode] = useState<WorkLogModalMode>(null);
  const [workLogDraft, setWorkLogDraft] = useState<WorkLogPayload>(
    buildEmptyWorkLogPayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingWorkLog, setIsSavingWorkLog] = useState(false);

  const [qaReportModalMode, setQaReportModalMode] = useState<QaReportModalMode>(null);
  const [qaReportDraft, setQaReportDraft] = useState<QaReportPayload>(
    buildEmptyQaReportPayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingQaReport, setIsSavingQaReport] = useState(false);

  const [eventReportModalMode, setEventReportModalMode] =
    useState<EventReportModalMode>(null);
  const [eventReportDraft, setEventReportDraft] = useState<TestResultPayload>(
    buildEmptyTestResultPayload(EMPTY_BOOTSTRAP),
  );
  const [eventReportFindings, setEventReportFindings] = useState("");
  const [isSavingEventReport, setIsSavingEventReport] = useState(false);

  const [purchaseModalMode, setPurchaseModalMode] = useState<PurchaseModalMode>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);
  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseItemPayload>(
    buildEmptyPurchasePayload(EMPTY_BOOTSTRAP),
  );
  const [purchaseFinalCost, setPurchaseFinalCost] = useState("");
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  const [manufacturingModalMode, setManufacturingModalMode] =
    useState<ManufacturingModalMode>(null);
  const [activeManufacturingId, setActiveManufacturingId] = useState<string | null>(
    null,
  );
  const [manufacturingDraft, setManufacturingDraft] =
    useState<ManufacturingItemPayload>(
      buildEmptyManufacturingPayload(EMPTY_BOOTSTRAP, "cnc"),
    );
  const [isSavingManufacturing, setIsSavingManufacturing] = useState(false);

  const [materialModalMode, setMaterialModalMode] = useState<MaterialModalMode>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [materialDraft, setMaterialDraft] = useState<MaterialPayload>(
    buildEmptyMaterialPayload(),
  );
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

  const [partDefinitionModalMode, setPartDefinitionModalMode] =
    useState<PartDefinitionModalMode>(null);
  const [activePartDefinitionId, setActivePartDefinitionId] = useState<string | null>(
    null,
  );
  const [partDefinitionDraft, setPartDefinitionDraft] =
    useState<PartDefinitionPayload>(buildEmptyPartDefinitionPayload(EMPTY_BOOTSTRAP));
  const [isSavingPartDefinition, setIsSavingPartDefinition] = useState(false);
  const [isDeletingPartDefinition, setIsDeletingPartDefinition] = useState(false);

  const [artifactModalMode, setArtifactModalMode] = useState<ArtifactModalMode>(null);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [artifactDraft, setArtifactDraft] = useState<ArtifactPayload>(
    buildEmptyArtifactPayload(EMPTY_BOOTSTRAP, { kind: "document" }),
  );
  const [isSavingArtifact, setIsSavingArtifact] = useState(false);
  const [isDeletingArtifact, setIsDeletingArtifact] = useState(false);

  const [workstreamModalMode, setWorkstreamModalMode] =
    useState<WorkstreamModalMode>(null);
  const [activeWorkstreamId, setActiveWorkstreamId] = useState<string | null>(null);
  const [workstreamDraft, setWorkstreamDraft] = useState<WorkstreamPayload>(
    buildEmptyWorkstreamPayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingWorkstream, setIsSavingWorkstream] = useState(false);

  const [partInstanceModalMode, setPartInstanceModalMode] =
    useState<PartInstanceModalMode>(null);
  const [activePartInstanceId, setActivePartInstanceId] = useState<string | null>(null);
  const [partInstanceDraft, setPartInstanceDraft] = useState<PartInstancePayload>(
    buildEmptyPartInstancePayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingPartInstance, setIsSavingPartInstance] = useState(false);

  const [subsystemModalMode, setSubsystemModalMode] =
    useState<SubsystemModalMode>(null);
  const [activeSubsystemId, setActiveSubsystemId] = useState<string | null>(null);
  const [subsystemDraft, setSubsystemDraft] = useState<SubsystemPayload>(
    buildEmptySubsystemPayload(EMPTY_BOOTSTRAP),
  );
  const [subsystemDraftRisks, setSubsystemDraftRisks] = useState("");
  const [isSavingSubsystem, setIsSavingSubsystem] = useState(false);

  const [mechanismModalMode, setMechanismModalMode] =
    useState<MechanismModalMode>(null);
  const [activeMechanismId, setActiveMechanismId] = useState<string | null>(null);
  const [mechanismDraft, setMechanismDraft] = useState<MechanismPayload>(
    buildEmptyMechanismPayload(EMPTY_BOOTSTRAP),
  );
  const [isSavingMechanism, setIsSavingMechanism] = useState(false);
  const [isDeletingMechanism, setIsDeletingMechanism] = useState(false);

  const [activePersonFilter, setActivePersonFilter] = useState<FilterSelection>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberPayload>({
    name: "",
    email: "",
    photoUrl: "",
    role: "student",
    elevated: false,
  });
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [memberEditDraft, setMemberEditDraft] = useState<MemberPayload | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [isAddSeasonPopupOpen, setIsAddSeasonPopupOpen] = useState(false);
  const [seasonNameDraft, setSeasonNameDraft] = useState("");
  const [isSavingSeason, setIsSavingSeason] = useState(false);
  const [robotProjectModalMode, setRobotProjectModalMode] =
    useState<"create" | "edit" | null>(null);
  const [robotProjectNameDraft, setRobotProjectNameDraft] = useState("");
  const [isSavingRobotProject, setIsSavingRobotProject] = useState(false);

  return {
    activeArtifactId,
    activeMechanismId,
    activeMaterialId,
    activeManufacturingId,
    activePersonFilter,
    activePartDefinitionId,
    activePartInstanceId,
    activePurchaseId,
    activeSubsystemId,
    activeTaskId,
    activeTimelineTaskDetailId,
    activeWorkstreamId,
    artifactDraft,
    artifactModalMode,
    eventReportDraft,
    eventReportFindings,
    eventReportModalMode,
    isAddPersonOpen,
    isAddSeasonPopupOpen,
    isDeletingArtifact,
    isDeletingMaterial,
    isDeletingMechanism,
    isDeletingMember,
    isDeletingPartDefinition,
    isDeletingTask,
    isEditPersonOpen,
    isSavingArtifact,
    isSavingEventReport,
    isSavingManufacturing,
    isSavingMaterial,
    isSavingMechanism,
    isSavingMember,
    isSavingPartDefinition,
    isSavingPartInstance,
    isSavingPurchase,
    isSavingQaReport,
    isSavingRobotProject,
    isSavingSeason,
    isSavingSubsystem,
    isSavingTask,
    isSavingWorkLog,
    isSavingWorkstream,
    materialDraft,
    materialModalMode,
    manufacturingDraft,
    manufacturingModalMode,
    mechanismDraft,
    mechanismModalMode,
    memberEditDraft,
    memberForm,
    partDefinitionDraft,
    partDefinitionModalMode,
    partInstanceDraft,
    partInstanceModalMode,
    purchaseDraft,
    purchaseFinalCost,
    purchaseModalMode,
    qaReportDraft,
    qaReportModalMode,
    robotProjectModalMode,
    robotProjectNameDraft,
    seasonNameDraft,
    selectedMemberId,
    selectedProjectId,
    selectedSeasonId,
    setActiveArtifactId,
    setActiveMechanismId,
    setActiveMaterialId,
    setActiveManufacturingId,
    setActivePersonFilter,
    setActivePartDefinitionId,
    setActivePartInstanceId,
    setActivePurchaseId,
    setActiveSubsystemId,
    setActiveTaskId,
    setActiveTimelineTaskDetailId,
    setActiveWorkstreamId,
    setArtifactDraft,
    setArtifactModalMode,
    setEventReportDraft,
    setEventReportFindings,
    setEventReportModalMode,
    setIsAddPersonOpen,
    setIsAddSeasonPopupOpen,
    setIsDeletingArtifact,
    setIsDeletingMaterial,
    setIsDeletingMechanism,
    setIsDeletingMember,
    setIsDeletingPartDefinition,
    setIsDeletingTask,
    setIsEditPersonOpen,
    setIsSavingArtifact,
    setIsSavingEventReport,
    setIsSavingManufacturing,
    setIsSavingMaterial,
    setIsSavingMechanism,
    setIsSavingMember,
    setIsSavingPartDefinition,
    setIsSavingPartInstance,
    setIsSavingPurchase,
    setIsSavingQaReport,
    setIsSavingRobotProject,
    setIsSavingSeason,
    setIsSavingSubsystem,
    setIsSavingTask,
    setIsSavingWorkLog,
    setIsSavingWorkstream,
    setMaterialDraft,
    setMaterialModalMode,
    setManufacturingDraft,
    setManufacturingModalMode,
    setMechanismDraft,
    setMechanismModalMode,
    setMemberEditDraft,
    setMemberForm,
    setPartDefinitionDraft,
    setPartDefinitionModalMode,
    setPartInstanceDraft,
    setPartInstanceModalMode,
    setPurchaseDraft,
    setPurchaseFinalCost,
    setPurchaseModalMode,
    setQaReportDraft,
    setQaReportModalMode,
    setRobotProjectModalMode,
    setRobotProjectNameDraft,
    setSeasonNameDraft,
    setSelectedMemberId,
    setSelectedProjectId,
    setSelectedSeasonId,
    setShowTimelineCreateToggleInTaskModal,
    setSubsystemDraft,
    setSubsystemDraftRisks,
    setSubsystemModalMode,
    setTaskDraft,
    setTaskModalMode,
    setTimelineMilestoneCreateSignal,
    setWorkLogDraft,
    setWorkLogModalMode,
    setWorkstreamDraft,
    setWorkstreamModalMode,
    showTimelineCreateToggleInTaskModal,
    subsystemDraft,
    subsystemDraftRisks,
    subsystemModalMode,
    taskDraft,
    taskModalMode,
    timelineMilestoneCreateSignal,
    workLogDraft,
    workLogModalMode,
    workstreamDraft,
    workstreamModalMode,
  };
}

