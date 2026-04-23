import { useMemo } from "react";

import {
  Icon3DPrint,
  IconCnc,
  IconManufacturing,
  IconParts,
  IconPurchases,
  IconRoster,
  IconTasks,
} from "../components/shared/Icons";
import type { NavigationItem } from "../components/workspace/workspaceTypes";
import type { BootstrapPayload } from "../types";

interface UseWorkspaceDerivedDataArgs {
  activeTaskId: string | null;
  bootstrap: BootstrapPayload;
}

function recordById<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

export function useWorkspaceDerivedData({
  activeTaskId,
  bootstrap,
}: UseWorkspaceDerivedDataArgs) {
  const students = useMemo(
    () =>
      bootstrap.members.filter(
        (member) => member.role === "student" || member.role === "lead",
      ),
    [bootstrap.members],
  );

  const mentors = useMemo(
    () => bootstrap.members.filter((member) => member.role === "mentor"),
    [bootstrap.members],
  );

  const rosterMentors = useMemo(
    () =>
      bootstrap.members.filter(
        (member) => member.role === "mentor" || member.role === "admin",
      ),
    [bootstrap.members],
  );

  const membersById = useMemo(() => recordById(bootstrap.members), [bootstrap.members]);
  const subsystemsById = useMemo(() => recordById(bootstrap.subsystems), [bootstrap.subsystems]);
  const disciplinesById = useMemo(() => recordById(bootstrap.disciplines), [bootstrap.disciplines]);
  const mechanismsById = useMemo(() => recordById(bootstrap.mechanisms), [bootstrap.mechanisms]);
  const requirementsById = useMemo(() => recordById(bootstrap.requirements), [bootstrap.requirements]);
  const partDefinitionsById = useMemo(
    () => recordById(bootstrap.partDefinitions),
    [bootstrap.partDefinitions],
  );
  const partInstancesById = useMemo(
    () => recordById(bootstrap.partInstances),
    [bootstrap.partInstances],
  );
  const eventsById = useMemo(() => recordById(bootstrap.events), [bootstrap.events]);

  const activeTask = useMemo(
    () => bootstrap.tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, bootstrap.tasks],
  );

  const cncItems = useMemo(
    () => bootstrap.manufacturingItems.filter((item) => item.process === "cnc"),
    [bootstrap.manufacturingItems],
  );

  const printItems = useMemo(
    () => bootstrap.manufacturingItems.filter((item) => item.process === "3d-print"),
    [bootstrap.manufacturingItems],
  );

  const navigationItems = useMemo<NavigationItem[]>(
    () => [
      {
        value: "timeline",
        label: "Timeline",
        icon: <IconTasks />,
        count: bootstrap.tasks.length,
      },
      {
        value: "queue",
        label: "Task queue",
        icon: <IconTasks />,
        count: bootstrap.tasks.length,
      },
      {
        value: "purchases",
        label: "Purchases",
        icon: <IconPurchases />,
        count: bootstrap.purchaseItems.length,
      },
      {
        value: "cnc",
        label: "CNC",
        icon: <IconCnc />,
        count: cncItems.length,
      },
      {
        value: "prints",
        label: "3D print",
        icon: <Icon3DPrint />,
        count: printItems.length,
      },
      {
        value: "roster",
        label: "Roster",
        icon: <IconRoster />,
        count: bootstrap.members.length,
      },
      {
        value: "materials",
        label: "Materials",
        icon: <IconManufacturing />,
        count: bootstrap.materials.length,
      },
      {
        value: "parts",
        label: "Parts",
        icon: <IconParts />,
        count: bootstrap.partDefinitions.length + bootstrap.partInstances.length,
      },
    ],
    [
      bootstrap.manufacturingItems,
      bootstrap.materials.length,
      bootstrap.members.length,
      bootstrap.partDefinitions.length,
      bootstrap.partInstances.length,
      bootstrap.purchaseItems.length,
      bootstrap.tasks.length,
      cncItems.length,
      printItems.length,
    ],
  );

  return {
    activeTask,
    cncItems,
    disciplinesById,
    eventsById,
    mechanismsById,
    mentors,
    membersById,
    navigationItems,
    partDefinitionsById,
    partInstancesById,
    printItems,
    requirementsById,
    rosterMentors,
    students,
    subsystemsById,
  };
}
