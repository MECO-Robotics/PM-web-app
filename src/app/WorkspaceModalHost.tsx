import type { Dispatch, FormEvent, SetStateAction } from "react";

import {
  ManufacturingEditorModal,
  MaterialEditorModal,
  PartDefinitionEditorModal,
  PurchaseEditorModal,
  TaskEditorModal,
} from "../components/workspace/WorkspaceModals";
import type {
  ManufacturingModalMode,
  MaterialModalMode,
  PartDefinitionModalMode,
  PurchaseModalMode,
  TaskModalMode,
} from "./appTypes";
import type {
  BootstrapPayload,
  ManufacturingItemPayload,
  MaterialPayload,
  PartDefinitionPayload,
  PurchaseItemPayload,
  TaskPayload,
  TaskRecord,
} from "../types";

interface WorkspaceModalHostProps {
  activeMaterialId: string | null;
  activeTask: TaskRecord | null;
  bootstrap: BootstrapPayload;
  closeManufacturingModal: () => void;
  closeMaterialModal: () => void;
  closePartDefinitionModal: () => void;
  closePurchaseModal: () => void;
  closeTaskModal: () => void;
  disciplinesById: Record<string, BootstrapPayload["disciplines"][number]>;
  eventsById: Record<string, BootstrapPayload["events"][number]>;
  handleDeleteMaterial: (materialId: string) => Promise<void>;
  handleManufacturingSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleMaterialSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handlePartDefinitionSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handlePurchaseSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleTaskSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isDeletingMaterial: boolean;
  isSavingManufacturing: boolean;
  isSavingMaterial: boolean;
  isSavingPartDefinition: boolean;
  isSavingPurchase: boolean;
  isSavingTask: boolean;
  manufacturingDraft: ManufacturingItemPayload;
  manufacturingModalMode: ManufacturingModalMode;
  materialDraft: MaterialPayload;
  materialModalMode: MaterialModalMode;
  mechanismsById: Record<string, BootstrapPayload["mechanisms"][number]>;
  mentors: BootstrapPayload["members"];
  partDefinitionDraft: PartDefinitionPayload;
  partDefinitionModalMode: PartDefinitionModalMode;
  partDefinitionsById: Record<string, BootstrapPayload["partDefinitions"][number]>;
  partInstancesById: Record<string, BootstrapPayload["partInstances"][number]>;
  purchaseDraft: PurchaseItemPayload;
  purchaseFinalCost: string;
  purchaseModalMode: PurchaseModalMode;
  requirementsById: Record<string, BootstrapPayload["requirements"][number]>;
  setManufacturingDraft: Dispatch<SetStateAction<ManufacturingItemPayload>>;
  setMaterialDraft: Dispatch<SetStateAction<MaterialPayload>>;
  setPartDefinitionDraft: Dispatch<SetStateAction<PartDefinitionPayload>>;
  setPurchaseDraft: Dispatch<SetStateAction<PurchaseItemPayload>>;
  setPurchaseFinalCost: (value: string) => void;
  setTaskDraft: Dispatch<SetStateAction<TaskPayload>>;
  setTaskDraftBlockers: (value: string) => void;
  students: BootstrapPayload["members"];
  taskDraft: TaskPayload;
  taskDraftBlockers: string;
  taskModalMode: TaskModalMode;
}

export function WorkspaceModalHost({
  activeMaterialId,
  activeTask,
  bootstrap,
  closeManufacturingModal,
  closeMaterialModal,
  closePartDefinitionModal,
  closePurchaseModal,
  closeTaskModal,
  disciplinesById,
  eventsById,
  handleDeleteMaterial,
  handleManufacturingSubmit,
  handleMaterialSubmit,
  handlePartDefinitionSubmit,
  handlePurchaseSubmit,
  handleTaskSubmit,
  isDeletingMaterial,
  isSavingManufacturing,
  isSavingMaterial,
  isSavingPartDefinition,
  isSavingPurchase,
  isSavingTask,
  manufacturingDraft,
  manufacturingModalMode,
  materialDraft,
  materialModalMode,
  mechanismsById,
  mentors,
  partDefinitionDraft,
  partDefinitionModalMode,
  partDefinitionsById,
  partInstancesById,
  purchaseDraft,
  purchaseFinalCost,
  purchaseModalMode,
  requirementsById,
  setManufacturingDraft,
  setMaterialDraft,
  setPartDefinitionDraft,
  setPurchaseDraft,
  setPurchaseFinalCost,
  setTaskDraft,
  setTaskDraftBlockers,
  students,
  taskDraft,
  taskDraftBlockers,
  taskModalMode,
}: WorkspaceModalHostProps) {
  return (
    <>
      {taskModalMode ? (
        <TaskEditorModal
          activeTask={activeTask}
          bootstrap={bootstrap}
          closeTaskModal={closeTaskModal}
          disciplinesById={disciplinesById}
          eventsById={eventsById}
          handleTaskSubmit={handleTaskSubmit}
          isSavingTask={isSavingTask}
          mechanismsById={mechanismsById}
          mentors={mentors}
          partDefinitionsById={partDefinitionsById}
          partInstancesById={partInstancesById}
          requirementsById={requirementsById}
          setTaskDraft={setTaskDraft}
          setTaskDraftBlockers={setTaskDraftBlockers}
          students={students}
          taskDraft={taskDraft}
          taskDraftBlockers={taskDraftBlockers}
          taskModalMode={taskModalMode}
        />
      ) : null}

      {purchaseModalMode ? (
        <PurchaseEditorModal
          bootstrap={bootstrap}
          closePurchaseModal={closePurchaseModal}
          handlePurchaseSubmit={handlePurchaseSubmit}
          isSavingPurchase={isSavingPurchase}
          purchaseDraft={purchaseDraft}
          purchaseFinalCost={purchaseFinalCost}
          purchaseModalMode={purchaseModalMode}
          setPurchaseDraft={setPurchaseDraft}
          setPurchaseFinalCost={setPurchaseFinalCost}
        />
      ) : null}

      {manufacturingModalMode ? (
        <ManufacturingEditorModal
          bootstrap={bootstrap}
          closeManufacturingModal={closeManufacturingModal}
          handleManufacturingSubmit={handleManufacturingSubmit}
          isSavingManufacturing={isSavingManufacturing}
          manufacturingDraft={manufacturingDraft}
          manufacturingModalMode={manufacturingModalMode}
          setManufacturingDraft={setManufacturingDraft}
        />
      ) : null}

      {materialModalMode ? (
        <MaterialEditorModal
          activeMaterialId={activeMaterialId}
          closeMaterialModal={closeMaterialModal}
          handleDeleteMaterial={handleDeleteMaterial}
          handleMaterialSubmit={handleMaterialSubmit}
          isDeletingMaterial={isDeletingMaterial}
          isSavingMaterial={isSavingMaterial}
          materialDraft={materialDraft}
          materialModalMode={materialModalMode}
          setMaterialDraft={setMaterialDraft}
        />
      ) : null}

      {partDefinitionModalMode ? (
        <PartDefinitionEditorModal
          bootstrap={bootstrap}
          closePartDefinitionModal={closePartDefinitionModal}
          handlePartDefinitionSubmit={handlePartDefinitionSubmit}
          isSavingPartDefinition={isSavingPartDefinition}
          partDefinitionDraft={partDefinitionDraft}
          partDefinitionModalMode={partDefinitionModalMode}
          setPartDefinitionDraft={setPartDefinitionDraft}
        />
      ) : null}
    </>
  );
}
