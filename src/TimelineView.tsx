import React, { useMemo, useState } from "react";
import type { BootstrapPayload, TaskRecord } from "./types";
import { dateDiffInDays } from "./appUtils";

interface TimelineViewProps {
    bootstrap: BootstrapPayload;
    activePersonFilter: string;
    membersById: Record<string, any>;
    openEditTaskModal: (task: TaskRecord) => void;
    openCreateTaskModal: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
    bootstrap,
    activePersonFilter,
    membersById,
    openEditTaskModal,
    openCreateTaskModal,
}) => {
    const [viewInterval, setViewInterval] = useState<"all" | "week" | "month">("all");
    const [collapsedSubsystems, setCollapsedSubsystems] = useState<Record<string, boolean>>({});

    const timeline = useMemo(() => {
        if (!bootstrap.tasks.length) return { days: [], subsystemRows: [] };

        let startDate: string, endDate: string;
        if (viewInterval === "all") {
            const sorted = [...bootstrap.tasks].sort((a, b) => a.startDate.localeCompare(b.startDate));
            const endSorted = [...bootstrap.tasks].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
            const startObj = new Date(`${sorted[0].startDate}T00:00:00`);
            startObj.setDate(1);
            const endObj = new Date(`${endSorted[0].dueDate}T00:00:00`);
            endObj.setMonth(endObj.getMonth() + 1);
            endObj.setDate(0);
            startDate = startObj.toISOString().slice(0, 10);
            endDate = endObj.toISOString().slice(0, 10);
        } else {
            const now = new Date();
            now.setHours(12, 0, 0, 0);
            let s: Date, e: Date;
            if (viewInterval === "week") {
                s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 12);
                e = new Date(s); e.setDate(s.getDate() + 6);
            } else {
                s = new Date(now.getFullYear(), now.getMonth(), 1, 12);
                e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
            }
            startDate = s.toISOString().slice(0, 10);
            endDate = e.toISOString().slice(0, 10);
        }

        const totalDays = dateDiffInDays(startDate, endDate) + 1;
        const days = Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(`${startDate}T00:00:00`);
            d.setDate(d.getDate() + i);
            return d.toISOString().slice(0, 10);
        });

        const subsystemRows = bootstrap.subsystems.map((sub) => {
            const subTasks = bootstrap.tasks
                .filter((t) => t.subsystemId === sub.id && t.startDate <= endDate && t.dueDate >= startDate)
                .map((t) => ({
                    ...t,
                    offset: dateDiffInDays(startDate, t.startDate < startDate ? startDate : t.startDate),
                    span: Math.max(1, dateDiffInDays(t.startDate < startDate ? startDate : t.startDate, t.dueDate > endDate ? endDate : t.dueDate) + 1),
                }));
            return { id: sub.id, name: sub.name, taskCount: subTasks.length, completeCount: subTasks.filter(t => t.status === 'complete').length, tasks: subTasks };
        });

        return { days, subsystemRows };
    }, [bootstrap.subsystems, bootstrap.tasks, viewInterval]);

    const timelineGridTemplate = useMemo(() => {
        const dayWidth = viewInterval === "all" ? "44px" : viewInterval === "week" ? "minmax(44px, 1fr)" : "minmax(28px, 1fr)";
        return `40px 200px repeat(${timeline.days.length}, ${dayWidth})`;
    }, [timeline.days.length, viewInterval]);

    const gridMinWidth = useMemo(() => {
        const minDayWidth = viewInterval === "month" ? 28 : 44;
        return 40 + 200 + (timeline.days.length * minDayWidth);
    }, [timeline.days.length, viewInterval]);

    const monthGroups = useMemo(() => {
        const groups: { month: string; span: number }[] = [];
        let lastMonth = "", currentSpan = 0;
        timeline.days.forEach((day) => {
            const monthName = new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: "long" });
            if (monthName !== lastMonth) {
                if (lastMonth !== "") groups.push({ month: lastMonth, span: currentSpan });
                lastMonth = monthName; currentSpan = 1;
            } else currentSpan++;
        });
        if (lastMonth) groups.push({ month: lastMonth, span: currentSpan });
        return groups;
    }, [timeline.days]);

    const toggleSubsystem = (id: string) => setCollapsedSubsystems(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <section className="panel dense-panel" style={{ margin: 0, borderRadius: 0, border: "none" }}>
            <div className="panel-header compact-header">
                <div>
                    <h2>Subsystem timeline</h2>
                    <p className="section-copy filter-copy">
                        {activePersonFilter === "all" ? "Showing all roster-linked tasks." : `Filtered to ${membersById[activePersonFilter]?.name ?? "selected person"}.`}
                    </p>
                </div>
                <div className="panel-actions">
                    <select
                        className="toolbar-filter-select"
                        onChange={(e) => setViewInterval(e.target.value as any)}
                        style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", background: "#fff", cursor: "pointer", marginRight: "8px" }}
                        value={viewInterval}
                    >
                        <option value="all">Full scope</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                    </select>
                    <button className="primary-action" onClick={openCreateTaskModal} type="button">New task</button>
                </div>
            </div>
            {timeline.days.length ? (
                <div className="timeline-shell" style={{ overflowX: "auto", padding: 0, background: "#fff", borderRadius: 0, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "grid", width: "100%", minWidth: `${gridMinWidth}px`, gridTemplateColumns: timelineGridTemplate, boxSizing: "border-box" }}>
                        <div style={{ gridRow: "1 / span 2", gridColumn: "1", position: "sticky", left: 0, top: 0, zIndex: 11, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", background: "#fff", boxSizing: "border-box" }} />
                        <div className="sticky-label" style={{ gridRow: "1 / span 2", gridColumn: "2", width: "200px", minWidth: "200px", maxWidth: "200px", padding: "10px 12px", fontWeight: "bold", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", boxSizing: "border-box", position: "sticky", left: "40px", zIndex: 15, background: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Subsystem / Task</div>

                        {(() => {
                            let currentCol = 3;
                            return monthGroups.map((group, idx) => {
                                const start = currentCol; currentCol += group.span;
                                return (
                                    <div key={`month-${idx}`} style={{ gridRow: "1", gridColumn: `${start} / span ${group.span}`, textAlign: "center", fontSize: "10px", fontWeight: "bold", padding: "6px 0", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textTransform: "uppercase", color: "var(--official-blue)", background: "#f1f5f9", position: "sticky", top: 0, zIndex: 12, boxSizing: "border-box" }}>
                                        {group.month}
                                    </div>
                                );
                            });
                        })()}

                        {timeline.days.map((day, dIdx) => {
                            const dateObj = new Date(`${day}T00:00:00`);
                            return (
                                <div className="timeline-day" key={day} style={{ gridRow: "2", gridColumn: dIdx + 3, textAlign: "center", fontSize: "9px", padding: "6px 0", borderRight: "1px solid #e2e8f0", borderBottom: "2px solid #e2e8f0", color: "#58667d", textTransform: "uppercase", display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", minWidth: 0, overflow: "hidden", boxSizing: "border-box", position: "sticky", top: "27px", zIndex: 12, background: "#fff" }}>
                                    <span style={{ whiteSpace: "nowrap", fontSize: "8px" }}>{dateObj.toLocaleDateString(undefined, { weekday: "short" })}</span>
                                    <strong style={{ fontSize: "11px", color: "var(--official-black)" }}>{dateObj.toLocaleDateString(undefined, { day: "numeric" })}</strong>
                                </div>
                            );
                        })}
                    </div>
                    {timeline.subsystemRows.map((subsystem) => {
                        const collapsed = collapsedSubsystems[subsystem.id] ?? false;
                        return (
                            <div className="subsystem-group" key={subsystem.id} style={{ width: "100%", minWidth: `${gridMinWidth}px`, background: "#fff" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "grid", width: "100%", minWidth: `${gridMinWidth}px`, gridTemplateColumns: timelineGridTemplate, background: "var(--official-white)", borderBottom: "1px solid #e2e8f0", minHeight: "44px" }}>
                                        <div className="subsystem-sidebar" style={{ display: "flex", justifyContent: "center", alignItems: "center", gridRow: "1", gridColumn: "1", borderRight: "1px solid #e2e8f0", background: "#f1f5f9", position: "sticky", left: 0, zIndex: 8, boxSizing: "border-box" }}>
                                            <button className="subsystem-toggle" onClick={() => toggleSubsystem(subsystem.id)} type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", fontSize: "12px", color: "#94a3b8" }}>
                                                {collapsed ? "▶" : "▼"}
                                            </button>
                                        </div>
                                        <div style={{ gridRow: "1", gridColumn: "2", width: "200px", minWidth: "200px", maxWidth: "200px", padding: "0 12px", fontWeight: "bold", fontSize: "0.9rem", color: "#334155", borderRight: "1px solid #e2e8f0", boxSizing: "border-box", display: "flex", alignItems: "center", position: "sticky", left: "40px", background: "inherit", zIndex: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {subsystem.name}
                                            <span style={{ fontSize: "0.7rem", fontWeight: "normal", color: "#94a3b8", marginLeft: "8px" }}>
                                                {subsystem.completeCount}/{subsystem.taskCount}
                                            </span>
                                        </div>
                                        {timeline.days.map((day, dIdx) => <div key={day} style={{ gridRow: "1", gridColumn: dIdx + 3, borderRight: "1px solid #e2e8f0" }} />)}
                                    </div>

                                    {!collapsed && subsystem.tasks.map((task) => (
                                        <div key={task.id} style={{ display: "grid", width: "100%", gridTemplateColumns: timelineGridTemplate, borderBottom: "1px solid #e2e8f0", minHeight: "44px" }}>
                                            <div style={{ gridRow: "1", gridColumn: "1", borderRight: "1px solid #e2e8f0", background: "#f1f5f9", position: "sticky", left: 0, zIndex: 8, boxSizing: "border-box" }} />
                                            <div className="task-label" style={{ gridRow: "1", gridColumn: "2", width: "200px", minWidth: "200px", maxWidth: "200px", padding: "0 12px", fontSize: "0.8rem", borderRight: "1px solid #e2e8f0", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", position: "sticky", left: "40px", background: "#fff", zIndex: 8, overflow: "hidden" }}>
                                                <strong style={{ display: "block", color: "#475569", lineHeight: "1.2" }}>{task.title}</strong>
                                                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{(task.ownerId ? membersById[task.ownerId]?.name : null) ?? "Unassigned"}</span>
                                            </div>
                                            {timeline.days.map((day, dIdx) => <div key={day} style={{ gridRow: "1", gridColumn: dIdx + 3, borderRight: "1px solid #e2e8f0" }} />)}
                                            <button
                                                className={`timeline-bar timeline-${task.status}`}
                                                onClick={() => openEditTaskModal(task)}
                                                style={{
                                                    gridRow: "1",
                                                    gridColumn: `${task.offset + 3} / span ${task.span}`,
                                                    margin: "6px 4px",
                                                    zIndex: 5,
                                                    borderRadius: "4px",
                                                    border: "none",
                                                    color: "#fff",
                                                    fontSize: "0.7rem",
                                                    textAlign: "left",
                                                    padding: "0 8px",
                                                    cursor: "pointer",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    alignSelf: "center",
                                                    minWidth: 0
                                                }}
                                                type="button"
                                            >
                                                {task.title}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="section-copy">Create a task to populate the subsystem timeline.</p>
            )}
        </section>
    );
};