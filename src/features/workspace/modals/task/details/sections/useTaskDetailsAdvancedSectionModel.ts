import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload, TaskRecord } from "@/types";
import {
  getTaskPrimaryTargetNameOptions,
  getTaskSelectedMechanismIds,
  getTaskSelectedPartInstanceIds,
  getTaskSelectedPrimaryTargetId,
  getTaskTargetGroupLabel,
  setTaskPrimaryTargetSelection,
} from "../../../../shared/task/taskTargeting";
import { formatIterationVersion } from "@/lib/appUtils";
import { getTaskDisciplinesForProject } from "@/lib/taskDisciplines";
import type { TaskDetailsEditableField } from "../../taskModalTypes";

interface UseTaskDetailsAdvancedSectionModelArgs {
  activeTask: TaskRecord;
  bootstrap: BootstrapPayload;
  setEditingField: Dispatch<SetStateAction<TaskDetailsEditableField | null>>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function useTaskDetailsAdvancedSectionModel({
  activeTask,
  bootstrap,
  setEditingField,
  setTaskDraft,
  taskDraft,
}: UseTaskDetailsAdvancedSectionModelArgs) {
  const editableTask = taskDraft ?? activeTask;
  const selectedProject =
    bootstrap.projects.find((project) => project.id === editableTask.projectId) ?? null;
  const availableDisciplines = getTaskDisciplinesForProject(selectedProject);
  const targetGroupLabel = getTaskTargetGroupLabel(selectedProject);
  const subsystemFieldLabel = targetGroupLabel === "Subsystems" ? "Subsystem" : "Workstream";
  const subsystemsById = Object.fromEntries(
    bootstrap.subsystems.map((subsystem) => [subsystem.id, subsystem] as const),
  ) as Record<string, BootstrapPayload["subsystems"][number]>;
  const mechanismsById = Object.fromEntries(
    bootstrap.mechanisms.map((mechanism) => [mechanism.id, mechanism] as const),
  ) as Record<string, BootstrapPayload["mechanisms"][number]>;
  const partInstancesById = Object.fromEntries(
    bootstrap.partInstances.map((partInstance) => [partInstance.id, partInstance] as const),
  ) as Record<string, BootstrapPayload["partInstances"][number]>;
  const partDefinitionsById = Object.fromEntries(
    bootstrap.partDefinitions.map((partDefinition) => [partDefinition.id, partDefinition] as const),
  ) as Record<string, BootstrapPayload["partDefinitions"][number]>;
  const projectSubsystems = bootstrap.subsystems
    .filter((subsystem) => subsystem.projectId === editableTask.projectId)
    .sort((left, right) => left.name.localeCompare(right.name) || left.iteration - right.iteration);
  const selectedPrimaryTargetId = getTaskSelectedPrimaryTargetId(editableTask);
  const primaryTargetNameOptions = getTaskPrimaryTargetNameOptions(projectSubsystems);
  const selectedPrimaryTarget = selectedPrimaryTargetId
    ? subsystemsById[selectedPrimaryTargetId] ?? null
    : null;
  const projectMechanisms = bootstrap.mechanisms.filter(
    (mechanism) => mechanism.subsystemId === selectedPrimaryTargetId,
  );
  const projectPartInstances = bootstrap.partInstances.filter(
    (partInstance) => partInstance.subsystemId === selectedPrimaryTargetId,
  );
  const selectedMechanismIds = getTaskSelectedMechanismIds(editableTask);
  const selectedPartInstanceIds = getTaskSelectedPartInstanceIds(editableTask);
  const getMechanismLabel = (mechanism: BootstrapPayload["mechanisms"][number]) =>
    `${mechanism.name} (${formatIterationVersion(mechanism.iteration)})`;
  const getPartInstanceLabel = (partInstance: BootstrapPayload["partInstances"][number]) => {
    const partDefinition = partDefinitionsById[partInstance.partDefinitionId];
    const partDefinitionLabel = partDefinition
      ? `${partDefinition.name} (${formatIterationVersion(partDefinition.iteration)})`
      : null;

    return partDefinitionLabel
      ? `${partInstance.name} (${partDefinitionLabel})`
      : partInstance.name;
  };
  const disciplineText = editableTask.disciplineId
    ? availableDisciplines.find((discipline) => discipline.id === editableTask.disciplineId)?.name ??
      "Not set"
    : "Not set";
  const getStableToneClassName = (value: string) => {
    const filterToneClasses = [
      "filter-tone-info",
      "filter-tone-success",
      "filter-tone-warning",
      "filter-tone-danger",
      "filter-tone-neutral",
    ] as const;
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }

    return filterToneClasses[hash % filterToneClasses.length];
  };
  const getDisciplineOptionToneClassName = (option: { id: string }) =>
    getStableToneClassName(option.id);
  const getSubsystemOptionToneClassName = (option: { id: string }) =>
    getStableToneClassName(option.id);
  const disciplineToneClassName = editableTask.disciplineId
    ? getDisciplineOptionToneClassName({ id: editableTask.disciplineId })
    : "filter-tone-neutral";
  const disciplinePillClassName = `pill task-detail-discipline-pill ${disciplineToneClassName}`;
  const subsystemToneClassName = selectedPrimaryTargetId
    ? getSubsystemOptionToneClassName({ id: selectedPrimaryTargetId })
    : "filter-tone-neutral";
  const subsystemPillClassName = `pill task-detail-subsystem-pill ${subsystemToneClassName}`;
  const subsystemNames = getTaskSelectedPrimaryTargetId(editableTask)
    ? selectedPrimaryTarget
      ? [`${selectedPrimaryTarget.name} (${formatIterationVersion(selectedPrimaryTarget.iteration)})`]
      : []
    : [];
  const mechanismNames = selectedMechanismIds
    .map((mechanismId) => mechanismsById[mechanismId])
    .filter((mechanism): mechanism is BootstrapPayload["mechanisms"][number] => Boolean(mechanism))
    .map(getMechanismLabel);
  const partLabels = selectedPartInstanceIds
    .map((partInstanceId) => partInstancesById[partInstanceId])
    .filter((partInstance): partInstance is BootstrapPayload["partInstances"][number] =>
      Boolean(partInstance),
    )
    .map(getPartInstanceLabel);
  const partsText = partLabels.length > 0 ? partLabels.join(", ") : "No part linked";

  const handleDisciplineChange = (selection: string[]) => {
    setTaskDraft?.((current) => ({
      ...current,
      disciplineId: selection[0] ?? "",
    }));
    setEditingField(null);
  };

  const handleSubsystemChange = (selection: string[]) => {
    setTaskDraft?.((current) =>
      setTaskPrimaryTargetSelection(current, bootstrap, selection[0] ?? ""),
    );
    setEditingField(null);
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTaskDraft?.((current) => ({ ...current, startDate: event.target.value }));
    setEditingField(null);
  };

  const handleMechanismChange = (selection: string[]) => {
    setTaskDraft?.((current) => ({
      ...current,
      mechanismIds: selection,
      mechanismId: selection[0] ?? null,
    }));
  };

  const handlePartsChange = (selection: string[]) => {
    setTaskDraft?.((current) => ({
      ...current,
      partInstanceIds: selection,
      partInstanceId: selection[0] ?? null,
    }));
  };

  return {
    availableDisciplines,
    disciplinePillClassName,
    disciplineText,
    editableTask,
    getDisciplineOptionToneClassName,
    getSubsystemOptionToneClassName,
    handleDisciplineChange,
    handleMechanismChange,
    handlePartsChange,
    handleStartDateChange,
    handleSubsystemChange,
    mechanismNames,
    partsText,
    primaryTargetNameOptions,
    projectMechanisms,
    projectPartInstances,
    selectedMechanismIds,
    selectedPartInstanceIds,
    selectedPrimaryTargetId,
    subsystemFieldLabel,
    subsystemNames,
    subsystemPillClassName,
  };
}
