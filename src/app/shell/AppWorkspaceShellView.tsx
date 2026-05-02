import { Suspense } from "react";

import { InteractiveTutorialOverlay } from "@/app/interactiveTutorial/InteractiveTutorialOverlay";
import { AppSidebar, AppTopbar, WorkspaceContent, WorkspaceModalHost, WorkspaceShellLoading } from "@/app/shell/workspaceShell";
import type { AppWorkspaceController } from "@/app/hooks/useAppWorkspaceController";
import { AddSeasonPopup, RobotProjectPopup, SidebarOverlay } from "./AppWorkspaceShellOverlays";

export function AppWorkspaceShellView({ controller }: { controller: AppWorkspaceController }) {
  const c = controller;

  return (
    <main
      className={`page-shell ${c.isDarkMode ? "dark-mode" : ""} ${c.isSidebarCollapsed ? "is-sidebar-collapsed" : ""} ${c.isSidebarOverlay ? "is-sidebar-overlay" : ""}`}
      style={c.pageShellStyle}
    >
      <Suspense fallback={<WorkspaceShellLoading />}>
        <AppTopbar
          activeTab={c.activeTab}
          handleSignOut={c.handleSignOut}
          inventoryView={c.inventoryView}
          isLoadingData={c.isLoadingData}
          isMyViewActive={c.isMyViewActive}
          isNonRobotProject={c.isNonRobotProject}
          loadWorkspace={c.loadWorkspace}
          manufacturingView={c.manufacturingView}
          riskManagementView={c.riskManagementView}
          reportsView={c.reportsView}
          myViewMemberName={c.signedInMember?.name ?? null}
          sessionUser={c.sessionUser}
          setInventoryView={c.setInventoryView}
          setManufacturingView={c.setManufacturingView}
          setRiskManagementView={c.setRiskManagementView}
          setReportsView={c.setReportsView}
          setTaskView={c.setTaskView}
          setWorklogsView={c.setWorklogsView}
          taskView={c.taskView}
          worklogsView={c.worklogsView}
          seasons={c.bootstrap.seasons}
          selectedSeasonId={c.selectedSeasonId}
          subsystemsLabel={c.subsystemsLabel}
          onCreateSeason={c.handleCreateSeason}
          onSelectSeason={c.setSelectedSeasonId}
          onToggleMyView={c.toggleMyView}
          isDarkMode={c.isDarkMode}
          toggleDarkMode={c.toggleDarkMode}
          isSidebarCollapsed={c.isSidebarCollapsed}
        />

        <AppSidebar
          activeTab={c.activeTab}
          items={c.navigationItems}
          onSelectTab={c.handleSidebarTabSelect}
          isCollapsed={c.isSidebarCollapsed}
          toggleSidebar={c.toggleSidebar}
          projects={c.projectsInSelectedSeason}
          selectedProjectId={c.selectedProjectId}
          onSelectProject={c.setSelectedProjectId}
          onCreateRobot={c.handleCreateRobot}
          onEditSelectedRobot={c.handleEditSelectedRobot}
        />

        {c.isAddSeasonPopupOpen ? <AddSeasonPopup controller={c} /> : null}
        {c.robotProjectModalMode ? <RobotProjectPopup controller={c} /> : null}
        <SidebarOverlay controller={c} />

        <WorkspaceContent
          activePersonFilter={c.activePersonFilter}
          activeTab={c.activeTab}
          tabSwitchDirection={c.tabSwitchDirection}
          allMembers={c.bootstrap.members}
          artifacts={c.scopedArtifacts}
          bootstrap={c.scopedBootstrap}
          cncItems={c.cncItems}
          dataMessage={c.dataMessage}
          taskEditNotice={c.taskEditNotice}
          fabricationItems={c.fabricationItems}
          handleCreateMember={c.handleCreateMember}
          handleReactivateMemberForSeason={c.handleReactivateMemberForSeason}
          handleDeleteMember={c.handleDeleteMember}
          handleTimelineEventDelete={c.handleTimelineEventDelete}
          handleTimelineEventSave={c.handleTimelineEventSave}
          handleUpdateMember={c.handleUpdateMember}
          requestMemberPhotoUpload={c.requestMemberPhotoUpload}
          isAddPersonOpen={c.isAddPersonOpen}
          isDeletingMember={c.isDeletingMember}
          isEditPersonOpen={c.isEditPersonOpen}
          isLoadingData={c.isLoadingData}
          isAllProjectsView={c.isAllProjectsView}
          isNonRobotProject={c.isNonRobotProject}
          isSavingMember={c.isSavingMember}
          memberEditDraft={c.memberEditDraft}
          memberForm={c.memberForm}
          membersById={c.membersById}
          openCreateManufacturingModal={c.openCreateManufacturingModal}
          openCreateArtifactModal={c.openCreateArtifactModal}
          openCreateMaterialModal={c.openCreateMaterialModal}
          openCreateMechanismModal={c.openCreateMechanismModal}
          openCreatePartInstanceModal={c.openCreatePartInstanceModal}
          openCreateSubsystemModal={c.openCreateSubsystemModal}
          openCreatePartDefinitionModal={c.openCreatePartDefinitionModal}
          openCreatePurchaseModal={c.openCreatePurchaseModal}
          openCreateTaskModal={c.openCreateTaskModal}
          openCreateTaskModalFromTimeline={c.openCreateTaskModalFromTimeline}
          openCreateWorkLogModal={c.openCreateWorkLogModal}
          openCreateQaReportModal={c.openCreateQaReportModal}
          openCreateEventReportModal={c.openCreateEventReportModal}
          openCreateWorkstreamModal={c.openCreateWorkstreamModal}
          openEditWorkstreamModal={c.openEditWorkstreamModal}
          onCreateRisk={c.handleCreateRisk}
          onDeleteRisk={c.handleDeleteRisk}
          onCncQuickStatusChange={c.handleCncQuickStatusChange}
          openEditManufacturingModal={c.openEditManufacturingModal}
          openEditArtifactModal={c.openEditArtifactModal}
          openEditMaterialModal={c.openEditMaterialModal}
          openEditMechanismModal={c.openEditMechanismModal}
          openEditPartInstanceModal={c.openEditPartInstanceModal}
          openEditSubsystemModal={c.openEditSubsystemModal}
          openEditPartDefinitionModal={c.openEditPartDefinitionModal}
          openEditPurchaseModal={c.openEditPurchaseModal}
          openTimelineTaskDetailsModal={c.openTimelineTaskDetailsModal}
          onUpdateRisk={c.handleUpdateRisk}
          printItems={c.printItems}
          rosterMentors={c.rosterMentors}
          showCncMentorQuickActions={
            c.signedInMember?.role === "mentor" ||
            c.signedInMember?.role === "admin" ||
            Boolean(c.signedInMember?.elevated)
          }
          manufacturingView={c.manufacturingView}
          inventoryView={c.inventoryView}
          riskManagementView={c.riskManagementView}
          reportsView={c.reportsView}
          taskView={c.taskView}
          worklogsView={c.worklogsView}
          selectMember={c.selectMember}
          selectedSeasonId={c.selectedSeasonId}
          selectedProject={c.selectedProject}
          selectedMemberId={c.selectedMemberId}
          setIsAddPersonOpen={c.setIsAddPersonOpen}
          setIsEditPersonOpen={c.setIsEditPersonOpen}
          setMemberEditDraft={c.setMemberEditDraft}
          setMemberForm={c.setMemberForm}
          setActivePersonFilter={c.setActivePersonFilter}
          students={c.students}
          disciplinesById={c.disciplinesById}
          externalMembers={c.externalMembers}
          mechanismsById={c.mechanismsById}
          partDefinitionsById={c.partDefinitionsById}
          subsystemsById={c.subsystemsById}
          timelineMilestoneCreateSignal={c.timelineMilestoneCreateSignal}
          disablePanelAnimations={c.isWorkspaceModalOpen}
          onDismissDataMessage={c.clearDataMessage}
          onDismissTaskEditNotice={c.clearTaskEditNotice}
          onStartInteractiveTutorial={() => void c.startInteractiveTutorial("planning")}
          onStartInteractiveTutorialChapter={(chapterId) =>
            void c.startInteractiveTutorial(chapterId)}
          interactiveTutorialChapters={c.interactiveTutorialChapters}
          isInteractiveTutorialActive={c.isInteractiveTutorialActive}
        />
      </Suspense>

      {c.interactiveTutorialOverlayProps ? (
        <InteractiveTutorialOverlay {...c.interactiveTutorialOverlayProps} />
      ) : null}

      {c.isWorkspaceModalOpen ? (
        <Suspense fallback={null}>
          <WorkspaceModalHost
            activeArtifactId={c.activeArtifactId}
            activePartDefinitionId={c.activePartDefinitionId}
            activeMaterialId={c.activeMaterialId}
            activeMechanismId={c.activeMechanismId}
            activeWorkstreamId={c.activeWorkstreamId}
            activeSubsystemId={c.activeSubsystemId}
            activeTask={c.activeTask}
            activeTimelineTaskDetail={c.activeTimelineTaskDetail}
            bootstrap={c.scopedBootstrap}
            closeManufacturingModal={c.closeManufacturingModal}
            closeArtifactModal={c.closeArtifactModal}
            closeMaterialModal={c.closeMaterialModal}
            closeMechanismModal={c.closeMechanismModal}
            closePartInstanceModal={c.closePartInstanceModal}
            closePartDefinitionModal={c.closePartDefinitionModal}
            closePurchaseModal={c.closePurchaseModal}
            closeQaReportModal={c.closeQaReportModal}
            closeEventReportModal={c.closeEventReportModal}
            closeTimelineTaskDetailsModal={c.closeTimelineTaskDetailsModal}
            closeWorkLogModal={c.closeWorkLogModal}
            closeSubsystemModal={c.closeSubsystemModal}
            closeTaskModal={c.closeTaskModal}
            closeWorkstreamModal={c.closeWorkstreamModal}
            onTaskEditCanceled={c.notifyTaskEditCanceled}
            requestPhotoUpload={c.requestPhotoUpload}
            disciplinesById={c.disciplinesById}
            eventsById={c.eventsById}
            handleDeleteMaterial={c.handleDeleteMaterial}
            handleDeleteArtifact={c.handleDeleteArtifact}
            handleToggleArtifactArchived={c.handleToggleArtifactArchived}
            handleDeletePartDefinition={c.handleDeletePartDefinition}
            handleDeleteMechanism={c.handleDeleteMechanism}
            handleTogglePartDefinitionArchived={c.handleTogglePartDefinitionArchived}
            handleToggleSubsystemArchived={c.handleToggleSubsystemArchived}
            handleToggleMechanismArchived={c.handleToggleMechanismArchived}
            handleToggleWorkstreamArchived={c.handleToggleWorkstreamArchived}
            handleDeleteTask={c.handleDeleteTask}
            handlePartInstanceSubmit={c.handlePartInstanceSubmit}
            handleMechanismSubmit={c.handleMechanismSubmit}
            handleManufacturingSubmit={c.handleManufacturingSubmit}
            handleMaterialSubmit={c.handleMaterialSubmit}
            handlePartDefinitionSubmit={c.handlePartDefinitionSubmit}
            handleArtifactSubmit={c.handleArtifactSubmit}
            handlePurchaseSubmit={c.handlePurchaseSubmit}
            handleQaReportSubmit={c.handleQaReportSubmit}
            handleEventReportSubmit={c.handleEventReportSubmit}
            handleWorkLogSubmit={c.handleWorkLogSubmit}
            handleSubsystemSubmit={c.handleSubsystemSubmit}
            handleTaskSubmit={c.handleTaskSubmit}
            handleResolveTaskBlocker={c.handleResolveTaskBlocker}
            handleWorkstreamSubmit={c.handleWorkstreamSubmit}
            isDeletingMaterial={c.isDeletingMaterial}
            isDeletingArtifact={c.isDeletingArtifact}
            isDeletingPartDefinition={c.isDeletingPartDefinition}
            isDeletingMechanism={c.isDeletingMechanism}
            isDeletingTask={c.isDeletingTask}
            isSavingManufacturing={c.isSavingManufacturing}
            isSavingArtifact={c.isSavingArtifact}
            isSavingMaterial={c.isSavingMaterial}
            isSavingPartDefinition={c.isSavingPartDefinition}
            isSavingPartInstance={c.isSavingPartInstance}
            isSavingMechanism={c.isSavingMechanism}
            isSavingPurchase={c.isSavingPurchase}
            isSavingQaReport={c.isSavingQaReport}
            isSavingEventReport={c.isSavingEventReport}
            isSavingWorkLog={c.isSavingWorkLog}
            isSavingSubsystem={c.isSavingSubsystem}
            isSavingTask={c.isSavingTask}
            isSavingWorkstream={c.isSavingWorkstream}
            artifactDraft={c.artifactDraft}
            artifactModalMode={c.artifactModalMode}
            manufacturingDraft={c.manufacturingDraft}
            manufacturingModalMode={c.manufacturingModalMode}
            materialDraft={c.materialDraft}
            materialModalMode={c.materialModalMode}
            mechanismsById={c.mechanismsById}
            mentors={c.mentors}
            mechanismDraft={c.mechanismDraft}
            mechanismModalMode={c.mechanismModalMode}
            partInstanceDraft={c.partInstanceDraft}
            partInstanceModalMode={c.partInstanceModalMode}
            partDefinitionDraft={c.partDefinitionDraft}
            partDefinitionModalMode={c.partDefinitionModalMode}
            partDefinitionsById={c.partDefinitionsById}
            partInstancesById={c.partInstancesById}
            purchaseDraft={c.purchaseDraft}
            purchaseFinalCost={c.purchaseFinalCost}
            purchaseModalMode={c.purchaseModalMode}
            qaReportDraft={c.qaReportDraft}
            qaReportModalMode={c.qaReportModalMode}
            eventReportDraft={c.eventReportDraft}
            eventReportFindings={c.eventReportFindings}
            eventReportModalMode={c.eventReportModalMode}
            workLogDraft={c.workLogDraft}
            workLogModalMode={c.workLogModalMode}
            workstreamDraft={c.workstreamDraft}
            workstreamModalMode={c.workstreamModalMode}
            setArtifactDraft={c.setArtifactDraft}
            setMechanismDraft={c.setMechanismDraft}
            setManufacturingDraft={c.setManufacturingDraft}
            setMaterialDraft={c.setMaterialDraft}
            setPartInstanceDraft={c.setPartInstanceDraft}
            setPartDefinitionDraft={c.setPartDefinitionDraft}
            setPurchaseDraft={c.setPurchaseDraft}
            setPurchaseFinalCost={c.setPurchaseFinalCost}
            setQaReportDraft={c.setQaReportDraft}
            setEventReportDraft={c.setEventReportDraft}
            setEventReportFindings={c.setEventReportFindings}
            setWorkLogDraft={c.setWorkLogDraft}
            setWorkstreamDraft={c.setWorkstreamDraft}
            setSubsystemDraft={c.setSubsystemDraft}
            setSubsystemDraftRisks={c.setSubsystemDraftRisks}
            setTaskDraft={c.setTaskDraft}
            showTimelineCreateToggleInTaskModal={c.showTimelineCreateToggleInTaskModal}
            onSwitchTaskCreateToMilestone={c.switchTaskCreateToMilestone}
            onOpenTaskEditFromTimelineDetails={c.openEditTaskModal}
            openTaskDetailsModal={c.openTimelineTaskDetailsModal}
            students={c.students}
            subsystemDraft={c.subsystemDraft}
            subsystemDraftRisks={c.subsystemDraftRisks}
            subsystemModalMode={c.subsystemModalMode}
            taskDraft={c.taskDraft}
            taskModalMode={c.taskModalMode}
          />
        </Suspense>
      ) : null}
    </main>
  );
}
