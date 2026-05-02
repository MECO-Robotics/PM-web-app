// @ts-nocheck
import type { AppWorkspaceModel } from "@/app/hooks/useAppWorkspaceModel";
import { useAppWorkspaceTaskModalActions } from "@/app/hooks/workspace/task/useAppWorkspaceTaskModalActions";
import { useAppWorkspaceTaskMutationActions } from "@/app/hooks/workspace/task/useAppWorkspaceTaskMutationActions";
import { useAppWorkspaceTaskSubmissionActions } from "@/app/hooks/workspace/task/useAppWorkspaceTaskSubmissionActions";

export type AppWorkspaceTaskActions = ReturnType<typeof useAppWorkspaceTaskActions>;

export function useAppWorkspaceTaskActions(model: AppWorkspaceModel) {
  const taskModalActions = useAppWorkspaceTaskModalActions(model);
  const taskSubmissionActions = useAppWorkspaceTaskSubmissionActions(
    model,
    taskModalActions.closeTaskModal,
  );
  const taskMutationActions = useAppWorkspaceTaskMutationActions(model, taskModalActions.closeTaskModal);

  return {
    ...taskModalActions,
    ...taskSubmissionActions,
    ...taskMutationActions,
  };
}
