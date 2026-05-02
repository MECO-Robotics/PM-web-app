import { useAppWorkspaceCatalogActions } from "@/app/hooks/useAppWorkspaceCatalogActions";
import { useAppWorkspaceModel } from "@/app/hooks/useAppWorkspaceModel";
import { useAppWorkspaceReportActions } from "@/app/hooks/useAppWorkspaceReportActions";
import { useAppWorkspaceRosterActions } from "@/app/hooks/useAppWorkspaceRosterActions";
import { useAppWorkspaceState } from "@/app/hooks/useAppWorkspaceState";
import { useAppWorkspaceTaskActions } from "@/app/hooks/useAppWorkspaceTaskActions";

export type AppWorkspaceController = ReturnType<typeof useAppWorkspaceController>;

export function useAppWorkspaceController() {
  const state = useAppWorkspaceState();
  const model = useAppWorkspaceModel(state);
  const taskActions = useAppWorkspaceTaskActions(model);
  const reportActions = useAppWorkspaceReportActions(model);
  const catalogActions = useAppWorkspaceCatalogActions(model);
  const rosterActions = useAppWorkspaceRosterActions(model);

  return {
    ...model,
    ...taskActions,
    ...reportActions,
    ...catalogActions,
    ...rosterActions,
  };
}
