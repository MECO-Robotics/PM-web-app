import React from "react";
import type { BootstrapPayload, MemberPayload } from "./types";
import { IconPlus, IconEdit, IconTrash } from "./Icons";

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
    students: any[];
    rosterMentors: any[];
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
    const openAddPersonPanel = (role: MemberPayload["role"]) => {
        setMemberForm({ name: "", role });
        setIsAddPersonOpen(true);
        setIsEditPersonOpen(false);
    };

    const openEditPersonPanel = (id: string) => {
        selectMember(id, bootstrap);
        setIsEditPersonOpen(true);
        setIsAddPersonOpen(false);
    };

    return (
        <section className="panel dense-panel roster-layout" style={{ margin: 0, borderRadius: 0, border: "none" }}>
            <div className="panel-header compact-header">
                <div><h2>Roster editor</h2></div>
            </div>
            <div className="roster-columns">
                <div className="panel-subsection">
                    <div className="roster-section-header">
                        <h3>Students</h3>
                        <button className="roster-section-add" onClick={() => openAddPersonPanel("student")} type="button"><IconPlus /></button>
                    </div>
                    <div className="roster-list">
                        {students.map((member) => (
                            <div className={member.id === selectedMemberId ? "member-row active" : "member-row"} key={member.id}>
                                <div className="member-row-actions">
                                    <button className="member-action-button" onClick={() => openEditPersonPanel(member.id)} type="button"><IconEdit /></button>
                                    <button className="member-action-button member-action-danger" disabled={isDeletingMember} onClick={() => handleDeleteMember(member.id)} type="button"><IconTrash /></button>
                                </div>
                                <button className="member-row-main" onClick={() => selectMember(member.id, bootstrap)} type="button">
                                    <strong>{member.name}</strong>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel-subsection">
                    <div className="roster-section-header">
                        <h3>Mentors</h3>
                        <button className="roster-section-add" onClick={() => openAddPersonPanel("mentor")} type="button"><IconPlus /></button>
                    </div>
                    <div className="roster-list">
                        {rosterMentors.map((member) => (
                            <div className={member.id === selectedMemberId ? "member-row active" : "member-row"} key={member.id}>
                                <div className="member-row-actions">
                                    <button className="member-action-button" onClick={() => openEditPersonPanel(member.id)} type="button"><IconEdit /></button>
                                    <button className="member-action-button member-action-danger" disabled={isDeletingMember} onClick={() => handleDeleteMember(member.id)} type="button"><IconTrash /></button>
                                </div>
                                <button className="member-row-main" onClick={() => selectMember(member.id, bootstrap)} type="button">
                                    <strong>{member.name}</strong>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel-subsection roster-editor-panel">
                    <div className="compact-form">
                        {isAddPersonOpen && (
                            <form className="compact-form roster-inline-form" onSubmit={handleCreateMember}>
                                <h3>Add person</h3>
                                <label className="field">
                                    <span>Name</span>
                                    <input onChange={(e) => setMemberForm(curr => ({ ...curr, name: e.target.value }))} required value={memberForm.name} />
                                </label>
                                <label className="field">
                                    <span>Role</span>
                                    <select onChange={(e) => setMemberForm(curr => ({ ...curr, role: e.target.value as any }))} value={memberForm.role}>
                                        <option value="student">Student</option>
                                        <option value="mentor">Mentor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                <button className="primary-action" disabled={isSavingMember} type="submit">{isSavingMember ? "Saving..." : "Add person"}</button>
                                <button className="secondary-action" onClick={() => setIsAddPersonOpen(false)} type="button">Cancel</button>
                            </form>
                        )}
                    </div>

                    <div className="compact-form">
                        {memberEditDraft ? (
                            isEditPersonOpen ? (
                                <form className="compact-form roster-inline-form" onSubmit={handleUpdateMember}>
                                    <h3>Edit selected person</h3>
                                    <label className="field">
                                        <span>Name</span>
                                        <input onChange={(e) => setMemberEditDraft(curr => curr ? { ...curr, name: e.target.value } : null)} value={memberEditDraft.name} />
                                    </label>
                                    <label className="field">
                                        <span>Role</span>
                                        <select onChange={(e) => setMemberEditDraft(curr => curr ? { ...curr, role: e.target.value as any } : null)} value={memberEditDraft.role}>
                                            <option value="student">Student</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </label>
                                    <button className="secondary-action" disabled={isSavingMember} type="submit">{isSavingMember ? "Saving..." : "Update person"}</button>
                                    <button className="secondary-action" onClick={() => setIsEditPersonOpen(false)} type="button">Cancel</button>
                                </form>
                            ) : null
                        ) : (
                            <div className="empty-state"><p>Select someone from the roster to edit their role or name.</p></div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};