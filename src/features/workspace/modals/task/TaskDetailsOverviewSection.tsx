import { TaskDetailsOverviewSectionView } from "./details/overview/TaskDetailsOverviewSectionView";
import type { TaskDetailsOverviewSectionProps } from "./details/overview/TaskDetailsOverviewTypes";

export function TaskDetailsOverviewSection(props: TaskDetailsOverviewSectionProps) {
  return <TaskDetailsOverviewSectionView {...props} />;
}
