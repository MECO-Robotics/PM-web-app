import { useAppWorkspaceReportModalActions } from "@/app/hooks/workspace/report/useAppWorkspaceReportModalActions";
import { useAppWorkspaceReportRiskActions } from "@/app/hooks/workspace/report/useAppWorkspaceReportRiskActions";
import { useAppWorkspaceReportSubmitActions } from "@/app/hooks/workspace/report/useAppWorkspaceReportSubmitActions";
import type { AppWorkspaceModel } from "@/app/hooks/useAppWorkspaceModel";

export type AppWorkspaceReportActions = ReturnType<typeof useAppWorkspaceReportActions>;

export function useAppWorkspaceReportActions(model: AppWorkspaceModel) {
  return {
    ...useAppWorkspaceReportModalActions(model),
    ...useAppWorkspaceReportRiskActions(model),
    ...useAppWorkspaceReportSubmitActions(model),
  };
}
