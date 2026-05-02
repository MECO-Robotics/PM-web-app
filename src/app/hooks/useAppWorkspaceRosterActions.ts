import type { AppWorkspaceModel } from "@/app/hooks/useAppWorkspaceModel";
import { useAppWorkspaceRosterMemberActions } from "@/app/hooks/workspace/roster/useAppWorkspaceRosterMemberActions";
import { useAppWorkspaceRosterRobotActions } from "@/app/hooks/workspace/roster/useAppWorkspaceRosterRobotActions";
import { useAppWorkspaceRosterSeasonActions } from "@/app/hooks/workspace/roster/useAppWorkspaceRosterSeasonActions";

export type AppWorkspaceRosterActions = ReturnType<typeof useAppWorkspaceRosterActions>;

export function useAppWorkspaceRosterActions(model: AppWorkspaceModel) {
  return {
    ...useAppWorkspaceRosterMemberActions(model),
    ...useAppWorkspaceRosterRobotActions(model),
    ...useAppWorkspaceRosterSeasonActions(model),
  };
}
