import React from "react";
import { IconEdit, IconPlus, IconTrash } from "../shared/Icons";
import type { BootstrapPayload, MemberPayload, MemberRecord } from "../../types";
import { WORKSPACE_PANEL_STYLE } from "./workspaceTypes";

interface RosterViewProps {
    bootstrap: BootstrapPayload;
    selectedMemberId: string | null;
    selectMember: (id: string | null, payload: BootstrapPayload) => void;
    isAddPersonOpen: boolean;
    setIsAddPersonOpen: (open: boolean) => void;
    isEditPersonOpen: boolean;
    setIsEditPersonOpen: (open: boolean) => void;
    memberForm: MemberPayload;
    setMemberForm: React.Dispatch<React.SetStateAction<MemberPayload>>;
    memberEditDraft: MemberPayload | null;
    setMemberEditDraft: React.Dispatch<React.SetStateAction<MemberPayload | null>>;
    handleCreateMember: (e: React.FormEvent<HTMLFormElement>) => void;
    handleUpdateMember: (e: React.FormEvent<HTMLFormElement>) => void;
    handleDeleteMember: (id: string) => void;
    isSavingMember: boolean;
    isDeletingMember: boolean;
    students: MemberRecord[];
    rosterMentors: MemberRecord[];
}

export const RosterView: React.FC<RosterViewProps> = ({
    bootstrap,
    selectedMemberId,
    selectMember,
    isAddPersonOpen,
    setIsAddPersonOpen,
    isEditPersonOpen,
    setIsEditPersonOpen,
    memberForm,
    setMemberForm,
    memberEditDraft,
    setMemberEditDraft,
    handleCreateMember,
    handleUpdateMember,
    handleDeleteMember,
    isSavingMember,
    isDeletingMember,
    students,
    rosterMentors,
}) => {
    const leadStudents = students.filter((member) => member.role === "lead");
    const regularStudents = students.filter((member) => member.role === "student");

    const openAddPersonPanel = (role: MemberPayload["role"]) => {
        setMemberForm({ name: "", role });
        setIsAddPersonOpen(true);
        setIsEditPersonOpen(false);
    };

    const closeAddPersonPopup = () => {
        setIsAddPersonOpen(false);
    };

    const openEditPersonPopup = (id: string) => {
        selectMember(id, bootstrap);
        setIsEditPersonOpen(true);
        setIsAddPersonOpen(false);
    };

    const closeEditPersonPopup = () => {
        setIsEditPersonOpen(false);
    };

    const renderMemberRow = (member: MemberRecord) => (
        <div className={member.id === selectedMemberId ? "member-row active editable-action-host" : "member-row editable-action-host"} key={member.id} style={{ background: "var(--bg-row-alt)", borderBottom: "1px solid var(--border-base)" }}>
            <button className="member-row-main" onClick={() => selectMember(member.id, bootstrap)} style={{ background: "transparent", border: "none", textAlign: "left", color: "inherit" }} type="button">
                <strong style={{ color: "var(--text-title)" }}>{member.name}</strong>
            </button>
            <div className="member-row-actions editable-action-reveal">
                <button
                    aria-label={`Edit ${member.name}`}
                    className="member-action-button"
                    onClick={() => openEditPersonPopup(member.id)}
                    title="Edit"
                    type="button"
                >
                    <IconEdit />
                </button>
            </div>
        </div>
    );

    return (
        <section className="panel dense-panel roster-layout" style={{ ...WORKSPACE_PANEL_STYLE, color: "var(--text-copy)" }}>
            <div className="panel-header compact-header">
                <div className="queue-section-header">
                    <h2 style={{ color: "var(--text-title)" }}>Roster</h2>
                    <p className="section-copy" style={{ color: "var(--text-copy)" }}>Manage team members, permissions, and roles.</p>
                </div>
            </div>
            <div className="roster-columns">
                <div className="panel-subsection">
                    <div className="roster-section-header">
                        <div className="roster-section-title">
                            <h3 style={{ color: "var(--text-title)" }}>Students</h3>
                            <span className="sidebar-tab-count" style={{ position: "static" }}>{regularStudents.length}</span>
                        </div>
                        <button className="roster-section-add" onClick={() => openAddPersonPanel("student")} type="button"><IconPlus /></button>
                    </div>
                    <div className="roster-list">
                        {regularStudents.map(renderMemberRow)}
                    </div>
                </div>

                <div className="panel-subsection">
                    <div className="roster-section-header">
                        <div className="roster-section-title">
                            <h3 style={{ color: "var(--text-title)" }}>Lead Students</h3>
                            <span className="sidebar-tab-count" style={{ position: "static" }}>{leadStudents.length}</span>
                        </div>
                        <button className="roster-section-add" onClick={() => openAddPersonPanel("lead")} type="button"><IconPlus /></button>
                    </div>
                    <div className="roster-list">
                        {leadStudents.map(renderMemberRow)}
                    </div>
                </div>

                <div className="panel-subsection">
                    <div className="roster-section-header">
                        <div className="roster-section-title">
                            <h3 style={{ color: "var(--text-title)" }}>Mentors</h3>
                            <span className="sidebar-tab-count" style={{ position: "static" }}>{rosterMentors.length}</span>
                        </div>
                        <button className="roster-section-add" onClick={() => openAddPersonPanel("mentor")} type="button"><IconPlus /></button>
                    </div>
                    <div className="roster-list">
                        {rosterMentors.map(renderMemberRow)}
                    </div>
                </div>

                <div className="panel-subsection roster-editor-panel">
                    <div className="compact-form">
                        <div className="empty-state">
                            <p>Select a person from the roster, then use the pencil button to edit them or delete them from the edit popup. Use the plus buttons to add new people.</p>
                        </div>
                    </div>
                </div>
            </div>

            {isAddPersonOpen ? (
                <div
                    className="modal-scrim"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeAddPersonPopup();
                        }
                    }}
                    role="presentation"
                    style={{ zIndex: 2000 }}
                >
                    <section aria-modal="true" className="modal-card roster-edit-modal" role="dialog" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}>
                        <div className="panel-header compact-header" style={{ padding: 0, marginBottom: "1rem" }}>
                            <div className="queue-section-header">
                                <h3 style={{ color: "var(--text-title)" }}>Add person</h3>
                                <p className="section-copy" style={{ color: "var(--text-copy)" }}>Create a new roster entry and assign its role.</p>
                            </div>
                        </div>
                        <form className="compact-form roster-inline-form" onSubmit={handleCreateMember}>
                            <label className="field">
                                <span style={{ color: "var(--text-title)" }}>Name</span>
                                <input onChange={(e) => setMemberForm((curr) => ({ ...curr, name: e.target.value }))} required style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }} value={memberForm.name} />
                            </label>
                            <label className="field">
                                <span style={{ color: "var(--text-title)" }}>Role</span>
                                <select onChange={(e) => setMemberForm((curr) => ({ ...curr, role: e.target.value as MemberPayload["role"] }))} style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }} value={memberForm.role}>
                                    <option value="student">Student</option>
                                    <option value="lead">Lead</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                            <div className="modal-actions modal-wide">
                                <button className="secondary-action" onClick={closeAddPersonPopup} type="button">Cancel</button>
                                <button className="primary-action" disabled={isSavingMember} type="submit">{isSavingMember ? "Saving..." : "Add person"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            ) : null}

            {isEditPersonOpen && memberEditDraft ? (
                <div
                    className="modal-scrim"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditPersonPopup();
                        }
                    }}
                    role="presentation"
                    style={{ zIndex: 2000 }}
                >
                    <section aria-modal="true" className="modal-card roster-edit-modal" role="dialog" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}>
                        <div className="panel-header compact-header" style={{ padding: 0, marginBottom: "1rem" }}>
                            <div className="queue-section-header">
                                <h3 style={{ color: "var(--text-title)" }}>Edit selected person</h3>
                                <p className="section-copy" style={{ color: "var(--text-copy)" }}>Update the name or role for the selected team member.</p>
                            </div>
                        </div>
                        <form className="compact-form roster-inline-form" onSubmit={handleUpdateMember}>
                            <label className="field">
                                <span style={{ color: "var(--text-title)" }}>Name</span>
                                <input onChange={(e) => setMemberEditDraft(curr => curr ? { ...curr, name: e.target.value } : null)} style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }} value={memberEditDraft.name} />
                            </label>
                            <label className="field">
                                <span style={{ color: "var(--text-title)" }}>Role</span>
                                <select onChange={(e) => setMemberEditDraft(curr => curr ? { ...curr, role: e.target.value as MemberPayload["role"] } : null)} style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }} value={memberEditDraft.role}>
                                    <option value="student">Student</option>
                                    <option value="lead">Lead</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                            <div className="modal-actions modal-wide">
                                <button
                                    className="danger-action"
                                    disabled={isDeletingMember}
                                    onClick={() => {
                                        if (selectedMemberId) {
                                            handleDeleteMember(selectedMemberId);
                                        }
                                    }}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", marginRight: "auto", whiteSpace: "nowrap" }}
                                    type="button"
                                >
                                    <IconTrash />
                                    {isDeletingMember ? "Deleting..." : "Delete"}
                                </button>
                                <button className="secondary-action" onClick={closeEditPersonPopup} type="button">Cancel</button>
                                <button className="primary-action" disabled={isSavingMember} type="submit">{isSavingMember ? "Saving..." : "Update person"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            ) : null}
        </section>
    );
};
