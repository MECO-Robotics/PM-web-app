import { useState, useMemo, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { RosterView } from "./RosterView";
import { TimelineView } from "./TimelineView";
import { PartsView } from "./PartsView";
import { IconManufacturing, IconPerson, IconTasks } from "../shared/Icons";
import { formatCurrency, formatDate } from "../../lib/appUtils";
import type {
  BootstrapPayload,
  ManufacturingItemRecord,
  MaterialRecord,
  MemberPayload,
  PartDefinitionRecord,
  PurchaseItemRecord,
  TaskRecord,
} from "../../types";

function TableCell({
  label,
  valueClassName,
  children,
}: {
  label: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <span className="table-cell" data-label={label}>
      <span className={`table-cell-value${valueClassName ? ` ${valueClassName}` : ""}`}>{children}</span>
    </span>
  );
}

interface WorkspaceContentProps {
  activePersonFilter: string;
  activeTab: string;
  bootstrap: BootstrapPayload;
  cncItems: ManufacturingItemRecord[];
  dataMessage: string | null;
  handleCreateMember: (event: FormEvent<HTMLFormElement>) => void;
  handleDeleteMember: (id: string) => void;
  handleUpdateMember: (event: FormEvent<HTMLFormElement>) => void;
  disciplinesById: Record<string, BootstrapPayload["disciplines"][number]>;
  eventsById: Record<string, BootstrapPayload["events"][number]>;
  isAddPersonOpen: boolean;
  isDeletingMaterial: boolean;
  isDeletingPartDefinition: boolean;
  isDeletingMember: boolean;
  isEditPersonOpen: boolean;
  isLoadingData: boolean;
  isSavingMember: boolean;
  handleDeleteMaterial: (id: string) => void;
  handleDeletePartDefinition: (id: string) => void;
  memberEditDraft: MemberPayload | null;
  memberForm: MemberPayload;
  membersById: Record<string, BootstrapPayload["members"][number]>;
  openCreateManufacturingModal: (process: "cnc" | "3d-print" | "fabrication") => void;
  openCreateMaterialModal: () => void;
  openCreatePartDefinitionModal: () => void;
  openCreatePurchaseModal: () => void;
  openCreateTaskModal: () => void;
  openEditManufacturingModal: (item: ManufacturingItemRecord) => void;
  openEditMaterialModal: (item: MaterialRecord) => void;
  openEditPartDefinitionModal: (item: PartDefinitionRecord) => void;
  openEditPurchaseModal: (item: PurchaseItemRecord) => void;
  openEditTaskModal: (task: TaskRecord) => void;
  printItems: ManufacturingItemRecord[];
  mechanismsById: Record<string, BootstrapPayload["mechanisms"][number]>;
  partDefinitionsById: Record<string, BootstrapPayload["partDefinitions"][number]>;
  partInstancesById: Record<string, BootstrapPayload["partInstances"][number]>;
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
  setActivePersonFilter: (value: string) => void;
  students: BootstrapPayload["members"];
  requirementsById: Record<string, BootstrapPayload["requirements"][number]>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

/**
 * Reusable component for the "dropdown styled as label" pattern.
 */
function FilterDropdown({
  icon,
  value,
  onChange,
  options,
  allLabel,
}: {
  icon: ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; name: string }[];
  allLabel: string;
}) {
  const isActive = value !== "all";
  return (
    <label
      className={`toolbar-filter toolbar-filter-compact${isActive ? " is-active" : ""}`}
    >
      <span className="toolbar-filter-icon">{icon}</span>
      <select
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    </label>
  );
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
  disciplinesById,
  eventsById,
  isAddPersonOpen,
  isDeletingMaterial,
  isDeletingPartDefinition,
  isDeletingMember,
  isEditPersonOpen,
  isLoadingData,
  isSavingMember,
  handleDeleteMaterial,
  handleDeletePartDefinition,
  memberEditDraft,
  memberForm,
  membersById,
  openCreateManufacturingModal,
  openCreateMaterialModal,
  openCreatePartDefinitionModal,
  openCreatePurchaseModal,
  openCreateTaskModal,
  openEditManufacturingModal,
  openEditMaterialModal,
  openEditPartDefinitionModal,
  openEditPurchaseModal,
  openEditTaskModal,
  printItems,
  mechanismsById,
  partDefinitionsById,
  partInstancesById,
  renderItemMeta,
  rosterMentors,
  selectMember,
  selectedMemberId,
  setIsAddPersonOpen,
  setIsEditPersonOpen,
  setMemberEditDraft,
  setMemberForm,
  setActivePersonFilter,
  students,
  requirementsById,
  subsystemsById,
}: WorkspaceContentProps) {
  const [queueSortField, setQueueSortField] = useState<string>("dueDate");
  const [queueSortOrder, setQueueSortOrder] = useState<"asc" | "desc">("asc");
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>("all");
  const [queueSubsystemFilter, setQueueSubsystemFilter] = useState<string>("all");
  const [queueOwnerFilter, setQueueOwnerFilter] = useState<string>("all");
  const [queuePriorityFilter, setQueuePriorityFilter] = useState<string>("all");
  const [queueSearchFilter, setQueueSearchFilter] = useState<string>("");

  // Purchase Filters
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseSubsystem, setPurchaseSubsystem] = useState("all");
  const [purchaseRequester, setPurchaseRequester] = useState("all");
  const [purchaseStatus, setPurchaseStatus] = useState("all");
  const [purchaseVendor, setPurchaseVendor] = useState("all");
  const [purchaseApproval, setPurchaseApproval] = useState("all");

  // Manufacturing Filters (CNC & Prints)
  const [mfgSearch, setMfgSearch] = useState("");
  const [mfgSubsystem, setMfgSubsystem] = useState("all");
  const [mfgRequester, setMfgRequester] = useState("all");
  const [mfgStatus, setMfgStatus] = useState("all");
  const [mfgMaterial, setMfgMaterial] = useState("all");
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialCategory, setMaterialCategory] = useState("all");
  const [materialStock, setMaterialStock] = useState("all");

  const uniqueMaterials = useMemo(() => {
    const materials = bootstrap.materials.length > 0
      ? bootstrap.materials.map((item) => item.name)
      : bootstrap.manufacturingItems.map((item) => item.material);
    return Array.from(new Set(materials)).sort();
  }, [bootstrap.manufacturingItems, bootstrap.materials]);

  const uniqueVendors = useMemo(() => {
    const vendors = bootstrap.purchaseItems.map((item) => item.vendor);
    return Array.from(new Set(vendors)).sort();
  }, [bootstrap.purchaseItems]);

  // Visibility logic for columns based on active filters
  const showSubsystemCol = queueSubsystemFilter === "all";
  const showOwnerCol = queueOwnerFilter === "all";
  const showStatusCol = queueStatusFilter === "all";
  const showPriorityCol = queuePriorityFilter === "all";

  const queueGridTemplate = [
    "minmax(200px, 2.5fr)", // Task column (always visible)
    showSubsystemCol ? "1fr" : null,
    showOwnerCol ? "1fr" : null,
    showStatusCol ? "1fr" : null,
    "1fr",                  // Due column (always visible)
    showPriorityCol ? "1fr" : null,
  ].filter(Boolean).join(" ");

  const purchaseGridTemplate = [
    "minmax(200px, 2.5fr)", // Item column
    purchaseVendor === "all" ? "1fr" : null, // Vendor
    "0.6fr",                // Qty
    purchaseStatus === "all" ? "1fr" : null,
    purchaseApproval === "all" ? "1fr" : null, // Mentor
    "1fr",                  // Est
    "1fr",                  // Final
  ].filter(Boolean).join(" ");

  const mfgGridTemplate = [
    "minmax(200px, 2.5fr)", // Part column
    mfgMaterial === "all" ? "1fr" : null,
    "0.6fr",                // Qty
    "1fr",                  // Batch
    "1fr",                  // Due
    mfgStatus === "all" ? "1fr" : null,
    "1fr",                  // Mentor
  ].filter(Boolean).join(" ");

  const getPillStyle = (value: string) => {
    const success = ["complete", "delivered", "approved", "low"];
    const info = ["in-progress", "shipped", "purchased", "medium"];
    const warning = ["waiting-for-qa", "qa", "requested", "high", "waiting"];
    const danger = ["not-started", "critical"];

    let prefix = "--status-neutral";
    if (success.includes(value)) prefix = "--status-success";
    else if (info.includes(value)) prefix = "--status-info";
    else if (warning.includes(value)) prefix = "--status-warning";
    else if (danger.includes(value)) prefix = "--status-danger";

    return {
      background: `var(${prefix}-bg)`,
      color: `var(${prefix}-text)`,
      border: "none",
      fontWeight: "600",
      fontSize: "0.7rem",
      padding: "2px 8px",
      borderRadius: "4px",
      textTransform: "capitalize" as const,
      width: "fit-content",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  const toggleSort = (field: string) => {
    if (queueSortField === field) {
      setQueueSortOrder(queueSortOrder === "asc" ? "desc" : "asc");
    } else {
      setQueueSortField(field);
      setQueueSortOrder("asc");
    }
  };

  const processedTasks = useMemo(() => {
    let result = [...bootstrap.tasks];

    if (queueStatusFilter !== "all") {
      result = result.filter((t) => t.status === queueStatusFilter);
    }
    if (queueSubsystemFilter !== "all") {
      result = result.filter((t) => t.subsystemId === queueSubsystemFilter);
    }
    if (queueOwnerFilter !== "all") {
      result = result.filter((t) => t.ownerId === queueOwnerFilter);
    }
    if (queuePriorityFilter !== "all") {
      result = result.filter((t) => t.priority === queuePriorityFilter);
    }
    if (queueSearchFilter.trim() !== "") {
      const search = queueSearchFilter.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.summary.toLowerCase().includes(search)
      );
    }

    const PRIORITY_VALS: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const STATUS_VALS: Record<string, number> = { "not-started": 1, "in-progress": 2, "waiting-for-qa": 3, complete: 4 };
    const readSortValue = (task: TaskRecord): string | number => {
      if (queueSortField === "priority") {
        return PRIORITY_VALS[task.priority] || 0;
      }

      if (queueSortField === "status") {
        return STATUS_VALS[task.status] || 0;
      }

      if (queueSortField === "subsystemId") {
        return subsystemsById[task.subsystemId]?.name ?? "";
      }

      if (queueSortField === "ownerId") {
        return membersById[task.ownerId ?? ""]?.name ?? "";
      }

      if (queueSortField === "title") {
        return task.title.toLowerCase();
      }

      if (queueSortField === "dueDate") {
        return task.dueDate;
      }

      return "";
    };

    return result.sort((a, b) => {
      const aVal = readSortValue(a);
      const bVal = readSortValue(b);

      if (aVal < bVal) return queueSortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return queueSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [bootstrap.tasks, queueStatusFilter, queueSubsystemFilter, queueOwnerFilter, queuePriorityFilter, queueSearchFilter, queueSortField, queueSortOrder, subsystemsById, membersById]);

  const filteredPurchases = useMemo(() => {
    return bootstrap.purchaseItems.filter((item) => {
      const matchesSearch = !purchaseSearch ||
        item.title.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
        item.vendor.toLowerCase().includes(purchaseSearch.toLowerCase());
      const matchesSubsystem = purchaseSubsystem === "all" || item.subsystemId === purchaseSubsystem;
      const matchesRequester = purchaseRequester === "all" || item.requestedById === purchaseRequester;
      const matchesStatus = purchaseStatus === "all" || item.status === purchaseStatus;
      const matchesVendor = purchaseVendor === "all" || item.vendor === purchaseVendor;
      const matchesApproval = purchaseApproval === "all" ||
        (purchaseApproval === "approved" ? item.approvedByMentor : !item.approvedByMentor);
      return matchesSearch && matchesSubsystem && matchesRequester && matchesStatus && matchesVendor && matchesApproval;
    });
  }, [bootstrap.purchaseItems, purchaseSearch, purchaseSubsystem, purchaseRequester, purchaseStatus, purchaseVendor, purchaseApproval]);

  const filteredCnc = useMemo(() => {
    return cncItems.filter((item) => {
      const matchesSearch = !mfgSearch || item.title.toLowerCase().includes(mfgSearch.toLowerCase());
      const matchesSubsystem = mfgSubsystem === "all" || item.subsystemId === mfgSubsystem;
      const matchesRequester = mfgRequester === "all" || item.requestedById === mfgRequester;
      const matchesStatus = mfgStatus === "all" || item.status === mfgStatus;
      const matchesMaterial = mfgMaterial === "all" || item.material === mfgMaterial;
      return matchesSearch && matchesSubsystem && matchesRequester && matchesStatus && matchesMaterial;
    });
  }, [cncItems, mfgSearch, mfgSubsystem, mfgRequester, mfgStatus, mfgMaterial]);

  const filteredPrints = useMemo(() => {
    return printItems.filter((item) => {
      const matchesSearch = !mfgSearch || item.title.toLowerCase().includes(mfgSearch.toLowerCase());
      const matchesSubsystem = mfgSubsystem === "all" || item.subsystemId === mfgSubsystem;
      const matchesRequester = mfgRequester === "all" || item.requestedById === mfgRequester;
      const matchesStatus = mfgStatus === "all" || item.status === mfgStatus;
      const matchesMaterial = mfgMaterial === "all" || item.material === mfgMaterial;
      return matchesSearch && matchesSubsystem && matchesRequester && matchesStatus && matchesMaterial;
    });
  }, [printItems, mfgSearch, mfgSubsystem, mfgRequester, mfgStatus, mfgMaterial]);

  const filteredMaterials = useMemo(() => {
    return bootstrap.materials.filter((material) => {
      const search = materialSearch.toLowerCase();
      const matchesSearch = !search ||
        material.name.toLowerCase().includes(search) ||
        material.vendor.toLowerCase().includes(search) ||
        material.location.toLowerCase().includes(search);
      const matchesCategory = materialCategory === "all" || material.category === materialCategory;
      const matchesStock = materialStock === "all" ||
        (materialStock === "low"
          ? material.onHandQuantity <= material.reorderPoint
          : material.onHandQuantity > material.reorderPoint);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [bootstrap.materials, materialCategory, materialSearch, materialStock]);

  const renderSearchInput = (value: string, onChange: (val: string) => void, placeholder: string) => {
    const isActive = value.trim() !== "";
    return (
      <div
        className={`toolbar-filter toolbar-filter-compact toolbar-search${isActive ? " is-active" : ""}`}
      >
        <span className="toolbar-filter-icon"><IconTasks /></span>
        <input className="toolbar-search-input" onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="text" value={value} />
      </div>
    );
  };

  const getSortIcon = (field: string) => {
    if (queueSortField !== field) return null;
    return queueSortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div
      className="dense-shell"
      style={{
        padding: 0,
        margin: 0,
        maxWidth: "none",
        width: "100%",
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
          setActivePersonFilter={setActivePersonFilter}
        />
      ) : null}

      {activeTab === "queue" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
          <div className="panel-header compact-header">
            <div className="queue-section-header">
              <h2 style={{ color: "var(--text-title)" }}>Task queue</h2>
              <p className="section-copy filter-copy" style={{ color: "var(--text-copy)" }}>
                {activePersonFilter === "all"
                  ? "All tasks in queue."
                  : `Only tasks owned by or mentored by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions filter-toolbar queue-toolbar materials-toolbar">
              {renderSearchInput(queueSearchFilter, setQueueSearchFilter, "Search tasks...")}

              <FilterDropdown
                allLabel="All subsystems"
                icon={<IconManufacturing />}
                onChange={setQueueSubsystemFilter}
                options={bootstrap.subsystems}
                value={queueSubsystemFilter}
              />

              <FilterDropdown
                allLabel="All owners"
                icon={<IconPerson />}
                onChange={setQueueOwnerFilter}
                options={bootstrap.members}
                value={queueOwnerFilter}
              />

              <FilterDropdown
                allLabel="All statuses"
                icon={<IconTasks />}
                onChange={setQueueStatusFilter}
                options={[
                  { id: "not-started", name: "Not started" },
                  { id: "in-progress", name: "In progress" },
                  { id: "waiting-for-qa", name: "Waiting for QA" },
                  { id: "complete", name: "Complete" },
                ]}
                value={queueStatusFilter}
              />

              <FilterDropdown
                allLabel="All priorities"
                icon={<IconTasks />}
                onChange={setQueuePriorityFilter}
                options={["critical", "high", "medium", "low"].map(p => ({ id: p, name: p }))}
                value={queuePriorityFilter}
              />

              <button aria-label="Add task" className="primary-action queue-toolbar-action" onClick={openCreateTaskModal} title="Add task" type="button">
                Add task
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="queue-table queue-table-header" style={{ gridTemplateColumns: queueGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
              <button className="table-sort-button" onClick={() => toggleSort("title")} type="button">Task{getSortIcon("title")}</button>
              {showSubsystemCol && <button className="table-sort-button" onClick={() => toggleSort("subsystemId")} type="button">Subsystem{getSortIcon("subsystemId")}</button>}
              {showOwnerCol && <button className="table-sort-button" onClick={() => toggleSort("ownerId")} type="button">Owner{getSortIcon("ownerId")}</button>}
              {showStatusCol && <button className="table-sort-button" onClick={() => toggleSort("status")} type="button">Status{getSortIcon("status")}</button>}
              <button className="table-sort-button" onClick={() => toggleSort("dueDate")} type="button">Due{getSortIcon("dueDate")}</button>
              {showPriorityCol && <button className="table-sort-button" onClick={() => toggleSort("priority")} type="button">Priority{getSortIcon("priority")}</button>}
            </div>
            {processedTasks.map((task) => (
              <button
                className="queue-table queue-row"
                key={task.id}
                onClick={() => openEditTaskModal(task)}
                style={{ gridTemplateColumns: queueGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)", marginBottom: "1px" }}
                type="button"
              >
                <span className="queue-title table-cell table-cell-primary" data-label="Task" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <strong style={{ color: "var(--text-title)" }}>{task.title}</strong>
                  <small style={{ color: "var(--text-copy)" }}>{task.summary}</small>
                  <small style={{ color: "var(--text-copy)" }}>
                    {(task.disciplineId ? disciplinesById[task.disciplineId]?.name : null) ?? "No discipline"}
                    {" · "}
                    {(task.mechanismId ? mechanismsById[task.mechanismId]?.name : null) ?? "No mechanism"}
                    {" · "}
                    {(task.partInstanceId
                      ? partInstancesById[task.partInstanceId]?.name ??
                      partDefinitionsById[partInstancesById[task.partInstanceId]?.partDefinitionId ?? ""]?.name
                      : null) ?? "No part"}
                    {task.requirementId
                      ? ` · ${requirementsById[task.requirementId]?.moscowPriority ?? ""} requirement`
                      : ""}
                    {task.targetEventId
                      ? ` · target ${eventsById[task.targetEventId]?.title ?? "event"}`
                      : ""}
                  </small>
                </span>
                {showSubsystemCol && <TableCell label="Subsystem">{(task.subsystemId ? subsystemsById[task.subsystemId]?.name : null) ?? "Unknown"}</TableCell>}
                {showOwnerCol && <TableCell label="Owner">{(task.ownerId ? membersById[task.ownerId]?.name : null) ?? "Unassigned"}</TableCell>}
                {showStatusCol && <TableCell label="Status" valueClassName="table-cell-pill"><span style={getPillStyle(task.status)}>{task.status.replace("-", " ")}</span></TableCell>}
                <TableCell label="Due">{formatDate(task.dueDate)}</TableCell>
                {showPriorityCol && <TableCell label="Priority" valueClassName="table-cell-pill"><span style={getPillStyle(task.priority)}>{task.priority}</span></TableCell>}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "purchases" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
          <div className="panel-header compact-header">
            <div className="queue-section-header">
              <h2 style={{ color: "var(--text-title)" }}>Purchase list</h2>
              <p className="section-copy filter-copy" style={{ color: "var(--text-copy)" }}>
                {activePersonFilter === "all"
                  ? "All purchase requests."
                  : `Only requests submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions filter-toolbar queue-toolbar purchase-toolbar" style={{ justifyContent: "flex-start" }}>
              {renderSearchInput(purchaseSearch, setPurchaseSearch, "Search items...")}

              <FilterDropdown
                allLabel="All subsystems"
                icon={<IconManufacturing />}
                onChange={setPurchaseSubsystem}
                options={bootstrap.subsystems}
                value={purchaseSubsystem}
              />

              <FilterDropdown
                allLabel="All requesters"
                icon={<IconPerson />}
                onChange={setPurchaseRequester}
                options={bootstrap.members}
                value={purchaseRequester}
              />

              <FilterDropdown
                allLabel="All statuses"
                icon={<IconTasks />}
                onChange={setPurchaseStatus}
                options={[
                  { id: "requested", name: "Requested" },
                  { id: "approved", name: "Approved" },
                  { id: "purchased", name: "Purchased" },
                  { id: "shipped", name: "Shipped" },
                  { id: "delivered", name: "Delivered" },
                ]}
                value={purchaseStatus}
              />

              <FilterDropdown
                allLabel="All vendors"
                icon={<IconTasks />}
                onChange={setPurchaseVendor}
                options={uniqueVendors.map(v => ({ id: v, name: v }))}
                value={purchaseVendor}
              />

              <FilterDropdown
                allLabel="All approvals"
                icon={<IconTasks />}
                onChange={setPurchaseApproval}
                options={[
                  { id: "approved", name: "Approved" },
                  { id: "waiting", name: "Waiting" },
                ]}
                value={purchaseApproval}
              />

              <button
                aria-label="Add purchase"
                className="primary-action queue-toolbar-action"
                onClick={openCreatePurchaseModal}
                title="Add purchase"
                type="button"
              >
                Add purchase
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header purchase-table" style={{ gridTemplateColumns: purchaseGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
              <span style={{ textAlign: "left" }}>Item</span>
              {purchaseVendor === "all" && <span>Vendor</span>}
              <span>Qty</span>
              {purchaseStatus === "all" && <span>Status</span>}
              {purchaseApproval === "all" && <span>Mentor</span>}
              <span>Est.</span>
              <span>Final</span>
            </div>
            {filteredPurchases.map((item) => (
              <button
                className="ops-table ops-row purchase-table ops-button-row"
                key={item.id}
                onClick={() => openEditPurchaseModal(item)}
                style={{ gridTemplateColumns: purchaseGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)", marginBottom: "1px" }}
                type="button"
              >
                <span className="queue-title table-cell table-cell-primary" data-label="Item" style={{ textAlign: "left" }}>
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                {purchaseVendor === "all" && <TableCell label="Vendor">{item.vendor}</TableCell>}
                <TableCell label="Qty">{item.quantity}</TableCell>
                {purchaseStatus === "all" && <TableCell label="Status" valueClassName="table-cell-pill"><span style={getPillStyle(item.status)}>{item.status}</span></TableCell>}
                {purchaseApproval === "all" && <TableCell label="Mentor" valueClassName="table-cell-pill"><span style={getPillStyle(item.approvedByMentor ? "approved" : "waiting")}>{item.approvedByMentor ? "Approved" : "Waiting"}</span></TableCell>}
                <TableCell label="Est.">{formatCurrency(item.estimatedCost)}</TableCell>
                <TableCell label="Final">{formatCurrency(item.finalCost)}</TableCell>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "cnc" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
          <div className="panel-header compact-header">
            <div className="queue-section-header">
              <h2 style={{ color: "var(--text-title)" }}>CNC queue</h2>
              <p className="section-copy filter-copy" style={{ color: "var(--text-copy)" }}>
                {activePersonFilter === "all"
                  ? "All CNC jobs."
                  : `Only CNC jobs submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions filter-toolbar queue-toolbar" style={{ justifyContent: "flex-start" }}>
              {renderSearchInput(mfgSearch, setMfgSearch, "Search parts...")}

              <FilterDropdown
                allLabel="All subsystems"
                icon={<IconManufacturing />}
                onChange={setMfgSubsystem}
                options={bootstrap.subsystems}
                value={mfgSubsystem}
              />

              <FilterDropdown
                allLabel="All requesters"
                icon={<IconPerson />}
                onChange={setMfgRequester}
                options={bootstrap.members}
                value={mfgRequester}
              />

              <FilterDropdown
                allLabel="All materials"
                icon={<IconManufacturing />}
                onChange={setMfgMaterial}
                options={uniqueMaterials.map(m => ({ id: m, name: m }))}
                value={mfgMaterial}
              />

              <FilterDropdown
                allLabel="All statuses"
                icon={<IconTasks />}
                onChange={setMfgStatus}
                options={[
                  { id: "requested", name: "Requested" },
                  { id: "approved", name: "Approved" },
                  { id: "in-progress", name: "In progress" },
                  { id: "qa", name: "QA" },
                  { id: "complete", name: "Complete" },
                ]}
                value={mfgStatus}
              />

              <button
                aria-label="Add CNC job"
                className="primary-action queue-toolbar-action"
                onClick={() => openCreateManufacturingModal("cnc")}
                title="Add CNC job"
                type="button"
              >
                Add CNC job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table" style={{ gridTemplateColumns: mfgGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
              <span style={{ textAlign: "left" }}>Part</span>
              {mfgMaterial === "all" && <span>Material</span>}
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              {mfgStatus === "all" && <span>Status</span>}
              <span>Mentor</span>
            </div>
            {filteredCnc.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                style={{ gridTemplateColumns: mfgGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)", marginBottom: "1px" }}
                type="button"
              >
                <span className="queue-title table-cell table-cell-primary" data-label="Part" style={{ textAlign: "left" }}>
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                {mfgMaterial === "all" && <TableCell label="Material">{item.material}</TableCell>}
                <TableCell label="Qty">{item.quantity}</TableCell>
                <TableCell label="Batch">{item.batchLabel ?? "Unbatched"}</TableCell>
                <TableCell label="Due">{formatDate(item.dueDate)}</TableCell>
                {mfgStatus === "all" && <TableCell label="Status" valueClassName="table-cell-pill"><span style={getPillStyle(item.status)}>{item.status.replace("-", " ")}</span></TableCell>}
                <TableCell label="Mentor">{item.mentorReviewed ? "Reviewed" : "Pending"}</TableCell>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "prints" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
          <div className="panel-header compact-header">
            <div className="queue-section-header">
              <h2 style={{ color: "var(--text-title)" }}>3D print queue</h2>
              <p className="section-copy filter-copy" style={{ color: "var(--text-copy)" }}>
                {activePersonFilter === "all"
                  ? "All 3D print jobs."
                  : `Only print jobs submitted by ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
              </p>
            </div>
            <div className="panel-actions filter-toolbar queue-toolbar" style={{ justifyContent: "flex-start" }}>
              {renderSearchInput(mfgSearch, setMfgSearch, "Search parts...")}

              <FilterDropdown
                allLabel="All subsystems"
                icon={<IconManufacturing />}
                onChange={setMfgSubsystem}
                options={bootstrap.subsystems}
                value={mfgSubsystem}
              />

              <FilterDropdown
                allLabel="All requesters"
                icon={<IconPerson />}
                onChange={setMfgRequester}
                options={bootstrap.members}
                value={mfgRequester}
              />

              <FilterDropdown
                allLabel="All materials"
                icon={<IconManufacturing />}
                onChange={setMfgMaterial}
                options={uniqueMaterials.map(m => ({ id: m, name: m }))}
                value={mfgMaterial}
              />

              <FilterDropdown
                allLabel="All statuses"
                icon={<IconTasks />}
                onChange={setMfgStatus}
                options={[
                  { id: "requested", name: "Requested" },
                  { id: "approved", name: "Approved" },
                  { id: "in-progress", name: "In progress" },
                  { id: "qa", name: "QA" },
                  { id: "complete", name: "Complete" },
                ]}
                value={mfgStatus}
              />

              <button
                aria-label="Add print job"
                className="primary-action queue-toolbar-action"
                onClick={() => openCreateManufacturingModal("3d-print")}
                title="Add print job"
                type="button"
              >
                Add print job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table" style={{ gridTemplateColumns: mfgGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
              <span style={{ textAlign: "left" }}>Part</span>
              {mfgMaterial === "all" && <span>Material</span>}
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              {mfgStatus === "all" && <span>Status</span>}
              <span>Mentor</span>
            </div>
            {filteredPrints.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                style={{ gridTemplateColumns: mfgGridTemplate, borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)", marginBottom: "1px" }}
                type="button"
              >
                <span className="queue-title table-cell table-cell-primary" data-label="Part" style={{ textAlign: "left" }}>
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                {mfgMaterial === "all" && <TableCell label="Material">{item.material}</TableCell>}
                <TableCell label="Qty">{item.quantity}</TableCell>
                <TableCell label="Batch">{item.batchLabel ?? "Unbatched"}</TableCell>
                <TableCell label="Due">{formatDate(item.dueDate)}</TableCell>
                {mfgStatus === "all" && <TableCell label="Status" valueClassName="table-cell-pill"><span style={getPillStyle(item.status)}>{item.status.replace("-", " ")}</span></TableCell>}
                <TableCell label="Mentor">{item.mentorReviewed ? "Reviewed" : "Pending"}</TableCell>
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

      {activeTab === "materials" ? (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
          <div className="panel-header compact-header">
            <div className="queue-section-header">
              <h2 style={{ color: "var(--text-title)" }}>Materials manager</h2>
              <p className="section-copy" style={{ color: "var(--text-copy)" }}>Inventory, reorder thresholds, vendors, and shop locations for build materials.</p>
            </div>
            <div className="panel-actions filter-toolbar queue-toolbar" style={{ justifyContent: "flex-start" }}>
              {renderSearchInput(materialSearch, setMaterialSearch, "Search materials...")}

              <FilterDropdown
                allLabel="All categories"
                icon={<IconManufacturing />}
                onChange={setMaterialCategory}
                options={[
                  { id: "metal", name: "Metal" },
                  { id: "plastic", name: "Plastic" },
                  { id: "filament", name: "Filament" },
                  { id: "electronics", name: "Electronics" },
                  { id: "hardware", name: "Hardware" },
                  { id: "consumable", name: "Consumable" },
                  { id: "other", name: "Other" },
                ]}
                value={materialCategory}
              />

              <FilterDropdown
                allLabel="All stock"
                icon={<IconTasks />}
                onChange={setMaterialStock}
                options={[
                  { id: "ok", name: "Stock OK" },
                  { id: "low", name: "Low stock" },
                ]}
                value={materialStock}
              />

              <button aria-label="Add material" className="primary-action queue-toolbar-action" onClick={openCreateMaterialModal} title="Add material" type="button">
                Add material
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header materials-table" style={{ gridTemplateColumns: "minmax(180px, 1.8fr) 0.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.6fr", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
              <span style={{ textAlign: "left" }}>Material</span>
              <span>Category</span>
              <span>On hand</span>
              <span>Reorder</span>
              <span>Location</span>
              <span>Vendor</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filteredMaterials.map((material) => {
              const isLow = material.onHandQuantity <= material.reorderPoint;
              return (
                <div
                  className="ops-table ops-row materials-table"
                  key={material.id}
                  style={{ gridTemplateColumns: "minmax(180px, 1.8fr) 0.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.6fr", padding: "12px 16px", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)" }}
                >
                  <TableCell label="Material">
                    <strong style={{ color: "var(--text-title)" }}>{material.name}</strong>
                    {material.notes ? <small style={{ color: "var(--text-copy)" }}>{material.notes}</small> : null}
                  </TableCell>
                  <TableCell label="Category">{material.category}</TableCell>
                  <TableCell label="On hand">{material.onHandQuantity} {material.unit}</TableCell>
                  <TableCell label="Reorder">{material.reorderPoint} {material.unit}</TableCell>
                  <TableCell label="Location">{material.location || "Unassigned"}</TableCell>
                  <TableCell label="Vendor">{material.vendor || "Unknown"}</TableCell>
                  <TableCell label="Status" valueClassName="table-cell-pill">
                    <span style={getPillStyle(isLow ? "critical" : "complete")}>
                      {isLow ? "Low stock" : "Stock OK"}
                    </span>
                  </TableCell>
                  <TableCell label="Actions">
                    <span style={{ display: "inline-flex", gap: "0.35rem" }}>
                      <button className="secondary-action" onClick={() => openEditMaterialModal(material)} style={{ padding: "0.35rem 0.6rem" }} type="button">
                        Edit
                      </button>
                      <button className="danger-action" disabled={isDeletingMaterial} onClick={() => handleDeleteMaterial(material.id)} style={{ padding: "0.35rem 0.6rem" }} type="button">
                        Delete
                      </button>
                    </span>
                  </TableCell>
                </div>
              );
            })}
            {filteredMaterials.length === 0 ? (
              <p className="empty-state">No materials match the current filters.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "parts" ? (
        <PartsView
          bootstrap={bootstrap}
          handleDeletePartDefinition={handleDeletePartDefinition}
          isDeletingPartDefinition={isDeletingPartDefinition}
          openCreatePartDefinitionModal={openCreatePartDefinitionModal}
          openEditPartDefinitionModal={openEditPartDefinitionModal}
          partDefinitionsById={partDefinitionsById}
          subsystemsById={subsystemsById}
        />
      ) : null}
    </div>
  );
}
