import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { RosterView } from "./RosterView";
import { TimelineView } from "./TimelineView";
import { formatCurrency, formatDate } from "../../lib/appUtils";
import type {
  BootstrapPayload,
  ManufacturingItemRecord,
  MemberPayload,
  PurchaseItemRecord,
  TaskRecord,
} from "../../types";

interface WorkspaceContentProps {
  activePersonFilter: string;
  activeTab: string;
  bootstrap: BootstrapPayload;
  cncItems: ManufacturingItemRecord[];
  dataMessage: string | null;
  handleCreateMember: (event: FormEvent<HTMLFormElement>) => void;
  handleDeleteMember: (id: string) => void;
  handleUpdateMember: (event: FormEvent<HTMLFormElement>) => void;
  isAddPersonOpen: boolean;
  isDeletingMember: boolean;
  isEditPersonOpen: boolean;
  isLoadingData: boolean;
  isSavingMember: boolean;
  memberEditDraft: MemberPayload | null;
  memberForm: MemberPayload;
  membersById: Record<string, BootstrapPayload["members"][number]>;
  openCreateManufacturingModal: (process: "cnc" | "3d-print" | "fabrication") => void;
  openCreatePurchaseModal: () => void;
  openCreateTaskModal: () => void;
  openEditManufacturingModal: (item: ManufacturingItemRecord) => void;
  openEditPurchaseModal: (item: PurchaseItemRecord) => void;
  openEditTaskModal: (task: TaskRecord) => void;
  printItems: ManufacturingItemRecord[];
  purchaseSummary: {
    delivered: number;
    totalEstimated: number;
  };
  renderItemMeta: (
    item: PurchaseItemRecord | ManufacturingItemRecord,
    membersById: Record<string, BootstrapPayload["members"][number]>,
    subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>,
  ) => ReactNode;
  rosterMentors: BootstrapPayload["members"];
  selectMember: (id: string | null, payload: BootstrapPayload) => void;
  selectedMemberId: string | null;
  setIsAddPersonOpen: (open: boolean) => void;
  setIsEditPersonOpen: (open: boolean) => void;
  setMemberEditDraft: Dispatch<SetStateAction<MemberPayload | null>>;
  setMemberForm: Dispatch<SetStateAction<MemberPayload>>;
  students: BootstrapPayload["members"];
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function WorkspaceContent({
  activePersonFilter,
  activeTab,
  bootstrap,
  cncItems,
  dataMessage,
  handleCreateMember,
  handleDeleteMember,
  handleUpdateMember,
  isAddPersonOpen,
  isDeletingMember,
  isEditPersonOpen,
  isLoadingData,
  isSavingMember,
  memberEditDraft,
  memberForm,
  membersById,
  openCreateManufacturingModal,
  openCreatePurchaseModal,
  openCreateTaskModal,
  openEditManufacturingModal,
  openEditPurchaseModal,
  openEditTaskModal,
  printItems,
  purchaseSummary,
  renderItemMeta,
  rosterMentors,
  selectMember,
  selectedMemberId,
  setIsAddPersonOpen,
  setIsEditPersonOpen,
  setMemberEditDraft,
  setMemberForm,
  students,
  subsystemsById,
}: WorkspaceContentProps) {
  return (
    <div
      className="dense-shell with-sidebar"
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        minHeight: "100%",
      }}
    >
      {dataMessage ? <p className="banner banner-error">{dataMessage}</p> : null}
      {isLoadingData ? <p className="banner">Refreshing workspace data...</p> : null}

      {activeTab === "timeline" ? (
        <TimelineView
          activePersonFilter={activePersonFilter}
          bootstrap={bootstrap}
          membersById={membersById}
          openCreateTaskModal={openCreateTaskModal}
          openEditTaskModal={openEditTaskModal}
        />
      ) : null}

      {activeTab === "queue" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none" }}>
          <div className="panel-header compact-header">
            <div>
              <h2>Task queue</h2>
              <p className="section-copy filter-copy">
                {activePersonFilter === "all"
                  ? "All tasks in queue."
                  : `Only tasks owned by or mentored by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions">
              <button className="primary-action" onClick={openCreateTaskModal} type="button">
                New task
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="queue-table queue-table-header">
              <span>Task</span>
              <span>Subsystem</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Due</span>
              <span>Priority</span>
            </div>
            {bootstrap.tasks.map((task) => (
              <button
                className="queue-table queue-row"
                key={task.id}
                onClick={() => openEditTaskModal(task)}
                type="button"
              >
                <span className="queue-title">
                  <strong>{task.title}</strong>
                  <small>{task.summary}</small>
                </span>
                <span>{(task.subsystemId ? subsystemsById[task.subsystemId]?.name : null) ?? "Unknown"}</span>
                <span>{(task.ownerId ? membersById[task.ownerId]?.name : null) ?? "Unassigned"}</span>
                <span className={`pill status-${task.status}`}>{task.status}</span>
                <span>{formatDate(task.dueDate)}</span>
                <span className={`pill priority-${task.priority}`}>{task.priority}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "purchases" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none" }}>
          <div className="panel-header compact-header">
            <div>
              <h2>Purchase list</h2>
              <p className="section-copy filter-copy">
                {activePersonFilter === "all"
                  ? "All purchase requests."
                  : `Only requests submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Estimated</span>
                  <strong>{formatCurrency(purchaseSummary.totalEstimated)}</strong>
                </div>
                <div className="mini-chip">
                  <span>Delivered</span>
                  <strong>{purchaseSummary.delivered}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={openCreatePurchaseModal}
                type="button"
              >
                Add purchase
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header purchase-table">
              <span>Item</span>
              <span>Vendor</span>
              <span>Qty</span>
              <span>Status</span>
              <span>Mentor</span>
              <span>Est.</span>
              <span>Final</span>
            </div>
            {bootstrap.purchaseItems.map((item) => (
              <button
                className="ops-table ops-row purchase-table ops-button-row"
                key={item.id}
                onClick={() => openEditPurchaseModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.vendor}</span>
                <span>{item.quantity}</span>
                <span className={`pill purchase-${item.status}`}>{item.status}</span>
                <span>{item.approvedByMentor ? "Approved" : "Waiting"}</span>
                <span>{formatCurrency(item.estimatedCost)}</span>
                <span>{formatCurrency(item.finalCost)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "cnc" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none" }}>
          <div className="panel-header compact-header">
            <div>
              <h2>CNC queue</h2>
              <p className="section-copy filter-copy">
                {activePersonFilter === "all"
                  ? "All CNC jobs."
                  : `Only CNC jobs submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Open jobs</span>
                  <strong>{cncItems.length}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={() => openCreateManufacturingModal("cnc")}
                type="button"
              >
                Add CNC job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table">
              <span>Part</span>
              <span>Material</span>
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              <span>Status</span>
              <span>Mentor</span>
            </div>
            {cncItems.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.material}</span>
                <span>{item.quantity}</span>
                <span>{item.batchLabel ?? "Unbatched"}</span>
                <span>{formatDate(item.dueDate)}</span>
                <span className={`pill manufacturing-${item.status}`}>{item.status}</span>
                <span>{item.mentorReviewed ? "Reviewed" : "Pending"}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "prints" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none" }}>
          <div className="panel-header compact-header">
            <div>
              <h2>3D print queue</h2>
              <p className="section-copy filter-copy">
                {activePersonFilter === "all"
                  ? "All 3D print jobs."
                  : `Only print jobs submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Open jobs</span>
                  <strong>{printItems.length}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={() => openCreateManufacturingModal("3d-print")}
                type="button"
              >
                Add print job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table">
              <span>Part</span>
              <span>Material</span>
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              <span>Status</span>
              <span>Mentor</span>
            </div>
            {printItems.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.material}</span>
                <span>{item.quantity}</span>
                <span>{item.batchLabel ?? "Unbatched"}</span>
                <span>{formatDate(item.dueDate)}</span>
                <span className={`pill manufacturing-${item.status}`}>{item.status}</span>
                <span>{item.mentorReviewed ? "Reviewed" : "Pending"}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "roster" ? (
        <RosterView
          bootstrap={bootstrap}
          handleCreateMember={handleCreateMember}
          handleDeleteMember={handleDeleteMember}
          handleUpdateMember={handleUpdateMember}
          isAddPersonOpen={isAddPersonOpen}
          isDeletingMember={isDeletingMember}
          isEditPersonOpen={isEditPersonOpen}
          isSavingMember={isSavingMember}
          memberEditDraft={memberEditDraft}
          memberForm={memberForm}
          rosterMentors={rosterMentors}
          selectMember={selectMember}
          selectedMemberId={selectedMemberId}
          setIsAddPersonOpen={setIsAddPersonOpen}
          setIsEditPersonOpen={setIsEditPersonOpen}
          setMemberEditDraft={setMemberEditDraft}
          setMemberForm={setMemberForm}
          students={students}
        />
      ) : null}
    </div>
  );
}
