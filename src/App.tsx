import {
  startTransition,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";
import {
  clearStoredSessionToken,
  createManufacturingItemRecord,
  createMemberRecord,
  createPurchaseItemRecord,
  createTask,
  exchangeGoogleCredential,
  fetchAuthConfig,
  fetchBootstrap,
  fetchCurrentUser,
  loadGoogleIdentityScript,
  loadStoredSessionToken,
  signOutFromGoogle,
  storeSessionToken,
  type AuthConfig,
  type GoogleCredentialResponse,
  type SessionUser,
  updateManufacturingItemRecord,
  updateMemberRecord,
  updatePurchaseItemRecord,
  updateTaskRecord,
  validateSession,
} from "./auth";
import type {
  BootstrapPayload,
  ManufacturingItemPayload,
  ManufacturingItemRecord,
  MemberPayload,
  PurchaseItemPayload,
  PurchaseItemRecord,
  TaskPayload,
  TaskRecord,
} from "./types";

type ViewTab = "timeline" | "queue" | "purchases" | "cnc" | "prints" | "roster";
type TaskModalMode = "create" | "edit" | null;
type PurchaseModalMode = "create" | "edit" | null;
type ManufacturingModalMode = "create" | "edit" | null;

const EMPTY_BOOTSTRAP: BootstrapPayload = {
  members: [],
  subsystems: [],
  tasks: [],
  purchaseItems: [],
  manufacturingItems: [],
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while checking your session.";
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number | undefined) {
  if (typeof value !== "number") {
    return "Pending";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateDiffInDays(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(values: string[]) {
  return values.join(", ");
}

function buildEmptyTaskPayload(bootstrap: BootstrapPayload): TaskPayload {
  const firstSubsystem = bootstrap.subsystems[0]?.id ?? "";
  const firstStudent =
    bootstrap.members.find((member) => member.role === "student")?.id ??
    bootstrap.members[0]?.id ??
    "";
  const firstMentor =
    bootstrap.members.find((member) => member.role === "mentor")?.id ??
    bootstrap.members[0]?.id ??
    "";
  const today = new Date().toISOString().slice(0, 10);

  return {
    title: "",
    summary: "",
    subsystemId: firstSubsystem,
    ownerId: firstStudent,
    mentorId: firstMentor,
    startDate: today,
    dueDate: today,
    priority: "medium",
    status: "not-started",
    estimatedHours: 4,
    actualHours: 0,
    blockers: [],
    dependencyIds: [],
    linkedManufacturingIds: [],
    linkedPurchaseIds: [],
    requiresDocumentation: false,
    documentationLinked: false,
  };
}

function buildEmptyPurchasePayload(bootstrap: BootstrapPayload): PurchaseItemPayload {
  const firstSubsystem = bootstrap.subsystems[0]?.id ?? "";
  const firstRequester = bootstrap.members[0]?.id ?? "";

  return {
    title: "",
    subsystemId: firstSubsystem,
    requestedById: firstRequester,
    quantity: 1,
    vendor: "",
    linkLabel: "",
    estimatedCost: 0,
    finalCost: undefined,
    approvedByMentor: false,
    status: "requested",
  };
}

function buildEmptyManufacturingPayload(
  bootstrap: BootstrapPayload,
  process: ManufacturingItemPayload["process"],
): ManufacturingItemPayload {
  const firstSubsystem = bootstrap.subsystems[0]?.id ?? "";
  const firstRequester = bootstrap.members[0]?.id ?? "";
  const today = new Date().toISOString().slice(0, 10);

  return {
    title: "",
    subsystemId: firstSubsystem,
    requestedById: firstRequester,
    process,
    dueDate: today,
    material: "",
    quantity: 1,
    status: "requested",
    mentorReviewed: false,
    batchLabel: "",
  };
}

function taskToPayload(task: TaskRecord): TaskPayload {
  return {
    title: task.title,
    summary: task.summary,
    subsystemId: task.subsystemId,
    ownerId: task.ownerId,
    mentorId: task.mentorId,
    startDate: task.startDate,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    blockers: task.blockers,
    dependencyIds: task.dependencyIds,
    linkedManufacturingIds: task.linkedManufacturingIds,
    linkedPurchaseIds: task.linkedPurchaseIds,
    requiresDocumentation: task.requiresDocumentation,
    documentationLinked: task.documentationLinked,
  };
}

function purchaseToPayload(item: PurchaseItemRecord): PurchaseItemPayload {
  return {
    title: item.title,
    subsystemId: item.subsystemId,
    requestedById: item.requestedById,
    quantity: item.quantity,
    vendor: item.vendor,
    linkLabel: item.linkLabel,
    estimatedCost: item.estimatedCost,
    finalCost: item.finalCost,
    approvedByMentor: item.approvedByMentor,
    status: item.status,
  };
}

function manufacturingToPayload(
  item: ManufacturingItemRecord,
): ManufacturingItemPayload {
  return {
    title: item.title,
    subsystemId: item.subsystemId,
    requestedById: item.requestedById,
    process: item.process,
    dueDate: item.dueDate,
    material: item.material,
    quantity: item.quantity,
    status: item.status,
    mentorReviewed: item.mentorReviewed,
    batchLabel: item.batchLabel ?? "",
  };
}

function renderItemMeta(
  item: PurchaseItemRecord | ManufacturingItemRecord,
  membersById: Record<string, BootstrapPayload["members"][number]>,
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>,
) {
  return (
    <>
      <strong>{item.title}</strong>
      <small>
        {subsystemsById[item.subsystemId]?.name ?? "Unknown subsystem"} /{" "}
        {membersById[item.requestedById]?.name ?? "Unassigned"}
      </small>
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>("timeline");
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authBooting, setAuthBooting] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapPayload>(EMPTY_BOOTSTRAP);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  const [taskModalMode, setTaskModalMode] = useState<TaskModalMode>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskPayload>(
    buildEmptyTaskPayload(EMPTY_BOOTSTRAP),
  );
  const [taskDraftBlockers, setTaskDraftBlockers] = useState("");
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [purchaseModalMode, setPurchaseModalMode] =
    useState<PurchaseModalMode>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);
  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseItemPayload>(
    buildEmptyPurchasePayload(EMPTY_BOOTSTRAP),
  );
  const [purchaseFinalCost, setPurchaseFinalCost] = useState("");
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  const [manufacturingModalMode, setManufacturingModalMode] =
    useState<ManufacturingModalMode>(null);
  const [activeManufacturingId, setActiveManufacturingId] = useState<string | null>(
    null,
  );
  const [manufacturingDraft, setManufacturingDraft] =
    useState<ManufacturingItemPayload>(
      buildEmptyManufacturingPayload(EMPTY_BOOTSTRAP, "cnc"),
    );
  const [isSavingManufacturing, setIsSavingManufacturing] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberPayload>({
    name: "",
    role: "student",
  });
  const [memberEditDraft, setMemberEditDraft] = useState<MemberPayload | null>(
    null,
  );
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [collapsedSubsystems, setCollapsedSubsystems] = useState<
    Record<string, boolean>
  >({});
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const students = useMemo(
    () => bootstrap.members.filter((member) => member.role === "student"),
    [bootstrap.members],
  );
  const mentors = useMemo(
    () => bootstrap.members.filter((member) => member.role === "mentor"),
    [bootstrap.members],
  );
  const membersById = useMemo(
    () => Object.fromEntries(bootstrap.members.map((member) => [member.id, member])),
    [bootstrap.members],
  );
  const subsystemsById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.subsystems.map((subsystem) => [subsystem.id, subsystem]),
      ),
    [bootstrap.subsystems],
  );
  const activeTask = useMemo(
    () => bootstrap.tasks.find((task) => task.id === activeTaskId) ?? null,
    [bootstrap.tasks, activeTaskId],
  );

  const timeline = useMemo(() => {
    if (!bootstrap.tasks.length) {
      return {
        days: [] as string[],
        subsystemRows: [] as Array<{
          id: string;
          name: string;
          taskCount: number;
          completeCount: number;
          tasks: Array<TaskRecord & { offset: number; span: number }>;
        }>,
      };
    }

    const sortedByStart = [...bootstrap.tasks].sort((left, right) => {
      return left.startDate.localeCompare(right.startDate);
    });
    const startDate = sortedByStart[0].startDate;
    const endDate = [...bootstrap.tasks].sort((left, right) => {
      return right.dueDate.localeCompare(left.dueDate);
    })[0].dueDate;
    const totalDays = dateDiffInDays(startDate, endDate) + 1;
    const days = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(`${startDate}T00:00:00`);
      date.setDate(date.getDate() + index);
      return date.toISOString().slice(0, 10);
    });

    const subsystemRows = bootstrap.subsystems.map((subsystem) => {
      const subsystemTasks = bootstrap.tasks
        .filter((task) => task.subsystemId === subsystem.id)
        .sort((left, right) => left.startDate.localeCompare(right.startDate))
        .map((task) => ({
          ...task,
          offset: dateDiffInDays(startDate, task.startDate),
          span: Math.max(1, dateDiffInDays(task.startDate, task.dueDate) + 1),
        }));

      return {
        id: subsystem.id,
        name: subsystem.name,
        taskCount: subsystemTasks.length,
        completeCount: subsystemTasks.filter((task) => task.status === "complete")
          .length,
        tasks: subsystemTasks,
      };
    });

    return {
      days,
      subsystemRows,
    };
  }, [bootstrap.subsystems, bootstrap.tasks]);

  const purchaseSummary = useMemo(() => {
    const totalEstimated = bootstrap.purchaseItems.reduce(
      (sum, item) => sum + item.estimatedCost,
      0,
    );
    const delivered = bootstrap.purchaseItems.filter(
      (item) => item.status === "delivered",
    ).length;

    return {
      totalEstimated,
      delivered,
    };
  }, [bootstrap.purchaseItems]);

  const cncItems = useMemo(
    () =>
      bootstrap.manufacturingItems.filter((item) => item.process === "cnc"),
    [bootstrap.manufacturingItems],
  );
  const printItems = useMemo(
    () =>
      bootstrap.manufacturingItems.filter((item) => item.process === "3d-print"),
    [bootstrap.manufacturingItems],
  );

  const enforcedAuthConfig = authConfig?.enabled ? authConfig : null;
  const googleClientId = enforcedAuthConfig?.googleClientId ?? null;
  const hostedDomain = enforcedAuthConfig?.hostedDomain ?? "";

  const handleUnauthorized = () => {
    signOutFromGoogle();
    startTransition(() => {
      setSessionUser(null);
    });
    setDataMessage("Your session expired. Please sign in again.");
  };

  const selectMember = (memberId: string | null, payload: BootstrapPayload) => {
    const member = payload.members.find((candidate) => candidate.id === memberId) ?? null;
    setSelectedMemberId(member?.id ?? null);
    setMemberEditDraft(
      member
        ? {
            name: member.name,
            role: member.role,
          }
        : null,
    );
  };

  const loadWorkspace = useCallback(async () => {
    setIsLoadingData(true);
    setDataMessage(null);

    try {
      const payload = await fetchBootstrap(handleUnauthorized);
      const nextMemberId =
        selectedMemberId && payload.members.some((member) => member.id === selectedMemberId)
          ? selectedMemberId
          : payload.members[0]?.id ?? null;

      startTransition(() => {
        setBootstrap(payload);
        setCollapsedSubsystems((current) => {
          const nextState = { ...current };
          payload.subsystems.forEach((subsystem) => {
            if (!(subsystem.id in nextState)) {
              nextState[subsystem.id] = false;
            }
          });
          return nextState;
        });
      });

      selectMember(nextMemberId, payload);

      if (taskModalMode === "create") {
        setTaskDraft(buildEmptyTaskPayload(payload));
        setTaskDraftBlockers("");
      }

      if (taskModalMode === "edit" && activeTaskId) {
        const nextTask = payload.tasks.find((task) => task.id === activeTaskId);
        if (nextTask) {
          setTaskDraft(taskToPayload(nextTask));
          setTaskDraftBlockers(joinList(nextTask.blockers));
        } else {
          setTaskModalMode(null);
          setActiveTaskId(null);
        }
      }

      if (purchaseModalMode === "create") {
        setPurchaseDraft(buildEmptyPurchasePayload(payload));
        setPurchaseFinalCost("");
      }

      if (purchaseModalMode === "edit" && activePurchaseId) {
        const nextItem = payload.purchaseItems.find((item) => item.id === activePurchaseId);
        if (nextItem) {
          setPurchaseDraft(purchaseToPayload(nextItem));
          setPurchaseFinalCost(
            typeof nextItem.finalCost === "number" ? String(nextItem.finalCost) : "",
          );
        } else {
          setPurchaseModalMode(null);
          setActivePurchaseId(null);
        }
      }

      if (manufacturingModalMode === "create") {
        setManufacturingDraft((current) =>
          buildEmptyManufacturingPayload(payload, current.process),
        );
      }

      if (manufacturingModalMode === "edit" && activeManufacturingId) {
        const nextItem = payload.manufacturingItems.find(
          (item) => item.id === activeManufacturingId,
        );
        if (nextItem) {
          setManufacturingDraft(manufacturingToPayload(nextItem));
        } else {
          setManufacturingModalMode(null);
          setActiveManufacturingId(null);
        }
      }
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsLoadingData(false);
    }
  }, [
    activeManufacturingId,
    activePurchaseId,
    activeTaskId,
    manufacturingModalMode,
    purchaseModalMode,
    selectedMemberId,
    taskModalMode,
  ]);

  const openCreateTaskModal = () => {
    setActiveTaskId(null);
    setTaskDraft(buildEmptyTaskPayload(bootstrap));
    setTaskDraftBlockers("");
    setTaskModalMode("create");
  };

  const openEditTaskModal = (task: TaskRecord) => {
    setActiveTaskId(task.id);
    setTaskDraft(taskToPayload(task));
    setTaskDraftBlockers(joinList(task.blockers));
    setTaskModalMode("edit");
  };

  const closeTaskModal = () => {
    setTaskModalMode(null);
    setActiveTaskId(null);
  };

  const openCreatePurchaseModal = () => {
    setActivePurchaseId(null);
    setPurchaseDraft(buildEmptyPurchasePayload(bootstrap));
    setPurchaseFinalCost("");
    setPurchaseModalMode("create");
  };

  const openEditPurchaseModal = (item: PurchaseItemRecord) => {
    setActivePurchaseId(item.id);
    setPurchaseDraft(purchaseToPayload(item));
    setPurchaseFinalCost(typeof item.finalCost === "number" ? String(item.finalCost) : "");
    setPurchaseModalMode("edit");
  };

  const closePurchaseModal = () => {
    setPurchaseModalMode(null);
    setActivePurchaseId(null);
  };

  const openCreateManufacturingModal = (
    process: ManufacturingItemPayload["process"],
  ) => {
    setActiveManufacturingId(null);
    setManufacturingDraft(buildEmptyManufacturingPayload(bootstrap, process));
    setManufacturingModalMode("create");
  };

  const openEditManufacturingModal = (item: ManufacturingItemRecord) => {
    setActiveManufacturingId(item.id);
    setManufacturingDraft(manufacturingToPayload(item));
    setManufacturingModalMode("edit");
  };

  const closeManufacturingModal = () => {
    setManufacturingModalMode(null);
    setActiveManufacturingId(null);
  };

  const handleGoogleCredential = useEffectEvent(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setAuthMessage("Google did not return a credential to verify.");
        return;
      }

      setIsSigningIn(true);
      setAuthMessage(null);

      try {
        const session = await exchangeGoogleCredential(response.credential);
        storeSessionToken(session.token);
        startTransition(() => {
          setSessionUser(session.user);
        });
      } catch (error) {
        clearStoredSessionToken();
        setAuthMessage(toErrorMessage(error));
      } finally {
        setIsSigningIn(false);
      }
    },
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      try {
        const config = await fetchAuthConfig();
        if (cancelled) {
          return;
        }

        setAuthConfig(config);

        if (!config.enabled) {
          return;
        }

        const storedToken = loadStoredSessionToken();
        if (!storedToken) {
          return;
        }

        try {
          const user = await fetchCurrentUser(storedToken);
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setSessionUser(user);
          });
        } catch {
          clearStoredSessionToken();
        }
      } catch (error) {
        if (!cancelled) {
          setAuthMessage(toErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setAuthBooting(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionUser || !enforcedAuthConfig) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void (async () => {
        const isValid = await validateSession();
        if (!isValid) {
          clearStoredSessionToken();
          signOutFromGoogle();
          startTransition(() => {
            setSessionUser(null);
          });
          setAuthMessage("Your session expired. Please sign in again.");
        }
      })();
    }, 5 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enforcedAuthConfig, sessionUser]);

  useEffect(() => {
    if (authBooting) {
      return;
    }

    if (authConfig?.enabled && !sessionUser) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authBooting, authConfig?.enabled, loadWorkspace, sessionUser]);

  useEffect(() => {
    if (authBooting || sessionUser || !googleClientId) {
      return;
    }

    const buttonSlot = googleButtonRef.current;
    if (!buttonSlot) {
      return;
    }

    let cancelled = false;
    const activeGoogleClientId = googleClientId;

    async function setupGoogleButton() {
      try {
        await loadGoogleIdentityScript();
        const activeButtonSlot = googleButtonRef.current;
        if (cancelled || !window.google || !activeButtonSlot) {
          return;
        }

        activeButtonSlot.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: activeGoogleClientId,
          callback: (response) => {
            void handleGoogleCredential(response);
          },
          hd: hostedDomain,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(activeButtonSlot, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
          logo_alignment: "left",
        });
      } catch (error) {
        if (!cancelled) {
          setAuthMessage(toErrorMessage(error));
        }
      }
    }

    void setupGoogleButton();

    return () => {
      cancelled = true;
      buttonSlot.innerHTML = "";
    };
  }, [authBooting, googleClientId, hostedDomain, sessionUser]);

  const handleSignOut = () => {
    clearStoredSessionToken();
    signOutFromGoogle();
    startTransition(() => {
      setSessionUser(null);
    });
    setAuthMessage(null);
    setBootstrap(EMPTY_BOOTSTRAP);
  };

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingTask(true);
    setDataMessage(null);

    try {
      const payload: TaskPayload = {
        ...taskDraft,
        blockers: splitList(taskDraftBlockers),
      };

      if (taskModalMode === "create") {
        await createTask(payload, handleUnauthorized);
      } else if (taskModalMode === "edit" && activeTaskId) {
        await updateTaskRecord(activeTaskId, payload, handleUnauthorized);
      }

      await loadWorkspace();
      closeTaskModal();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  };

  const handlePurchaseSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSavingPurchase(true);
    setDataMessage(null);

    try {
      const payload: PurchaseItemPayload = {
        ...purchaseDraft,
        finalCost:
          purchaseFinalCost.trim().length > 0 ? Number(purchaseFinalCost) : undefined,
      };

      if (purchaseModalMode === "create") {
        await createPurchaseItemRecord(payload, handleUnauthorized);
      } else if (purchaseModalMode === "edit" && activePurchaseId) {
        await updatePurchaseItemRecord(activePurchaseId, payload, handleUnauthorized);
      }

      await loadWorkspace();
      closePurchaseModal();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingPurchase(false);
    }
  };

  const handleManufacturingSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSavingManufacturing(true);
    setDataMessage(null);

    try {
      const payload: ManufacturingItemPayload = {
        ...manufacturingDraft,
        batchLabel: manufacturingDraft.batchLabel?.trim() || undefined,
      };

      if (manufacturingModalMode === "create") {
        await createManufacturingItemRecord(payload, handleUnauthorized);
      } else if (manufacturingModalMode === "edit" && activeManufacturingId) {
        await updateManufacturingItemRecord(
          activeManufacturingId,
          payload,
          handleUnauthorized,
        );
      }

      await loadWorkspace();
      closeManufacturingModal();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingManufacturing(false);
    }
  };

  const handleCreateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingMember(true);
    setDataMessage(null);

    try {
      await createMemberRecord(memberForm, handleUnauthorized);
      setMemberForm({ name: "", role: "student" });
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleUpdateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMemberId || !memberEditDraft) {
      return;
    }

    setIsSavingMember(true);
    setDataMessage(null);

    try {
      await updateMemberRecord(selectedMemberId, memberEditDraft, handleUnauthorized);
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingMember(false);
    }
  };

  const toggleSubsystem = (subsystemId: string) => {
    setCollapsedSubsystems((current) => ({
      ...current,
      [subsystemId]: !current[subsystemId],
    }));
  };

  if (authBooting) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>Loading sign-in requirements for MECO Robotics.</h1>
          <p className="auth-body">
            Checking the server-side auth configuration before the workspace opens.
          </p>
        </section>
      </main>
    );
  }

  if (!authConfig) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>Couldn&apos;t load the authentication configuration.</h1>
          <p className="auth-body">
            The app could not confirm the server-side sign-in rules, so access is
            paused until the API is reachable again.
          </p>
          {authMessage ? <p className="auth-error">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  if (enforcedAuthConfig && !sessionUser) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>Sign in with your {enforcedAuthConfig.hostedDomain} Google account.</h1>
          <p className="auth-body">
            Google verifies the account, and the API then issues a short-lived app
            session for the project-management workspace.
          </p>
          <div className="auth-chip-row">
            <span className="auth-chip">
              Hosted domain: {enforcedAuthConfig.hostedDomain}
            </span>
            <span className="auth-chip">Google ID token + app session</span>
          </div>
          <div className="google-button-slot" ref={googleButtonRef} />
          <p className="auth-note">
            {isSigningIn
              ? "Verifying your Google identity..."
              : `Choose a Google Workspace account from ${enforcedAuthConfig.hostedDomain}.`}
          </p>
          {authMessage ? <p className="auth-error">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell dense-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MECO PM</p>
          <h1>Project workspace</h1>
        </div>
        <div className="topbar-right">
          <div className="summary-chip">
            <span>Tasks</span>
            <strong>{bootstrap.tasks.length}</strong>
          </div>
          <div className="summary-chip">
            <span>Purchases</span>
            <strong>{bootstrap.purchaseItems.length}</strong>
          </div>
          <div className="summary-chip">
            <span>Manufacturing</span>
            <strong>{bootstrap.manufacturingItems.length}</strong>
          </div>
          <div className="summary-chip">
            <span>Roster</span>
            <strong>{bootstrap.members.length}</strong>
          </div>
          <div className="user-chip">
            <strong>{sessionUser?.name ?? "Local access"}</strong>
            <span>{sessionUser?.email ?? "Auth disabled"}</span>
          </div>
          <button className="secondary-action" onClick={() => void loadWorkspace()} type="button">
            Refresh
          </button>
          {sessionUser ? (
            <button className="secondary-action" onClick={handleSignOut} type="button">
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <nav className="tabbar" aria-label="Workspace views">
        {[
          ["timeline", "Timeline"],
          ["queue", "Task queue"],
          ["purchases", "Purchases"],
          ["cnc", "CNC"],
          ["prints", "3D print"],
          ["roster", "Roster editor"],
        ].map(([value, label]) => (
          <button
            className={activeTab === value ? "tab active" : "tab"}
            key={value}
            onClick={() => setActiveTab(value as ViewTab)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {dataMessage ? <p className="banner banner-error">{dataMessage}</p> : null}
      {isLoadingData ? <p className="banner">Refreshing workspace data...</p> : null}

      {activeTab === "timeline" ? (
        <section className="panel dense-panel">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">Schedule</p>
              <h2>Subsystem timeline</h2>
            </div>
            <div className="panel-actions">
              <button className="primary-action" onClick={openCreateTaskModal} type="button">
                New task
              </button>
            </div>
          </div>
          {timeline.days.length ? (
            <div className="timeline-shell">
              <div
                className="timeline-grid header-grid"
                style={{
                  gridTemplateColumns: `220px repeat(${timeline.days.length}, minmax(34px, 1fr))`,
                }}
              >
                <div className="sticky-label">Subsystem / Task</div>
                {timeline.days.map((day) => (
                  <div className="timeline-day" key={day}>
                    {formatDate(day)}
                  </div>
                ))}
              </div>
              {timeline.subsystemRows.map((subsystem) => {
                const collapsed = collapsedSubsystems[subsystem.id] ?? false;
                return (
                  <div className="subsystem-block" key={subsystem.id}>
                    <div
                      className="subsystem-row"
                      style={{
                        gridTemplateColumns: `220px repeat(${timeline.days.length}, minmax(34px, 1fr))`,
                      }}
                    >
                      <button
                        className="subsystem-toggle"
                        onClick={() => toggleSubsystem(subsystem.id)}
                        type="button"
                      >
                        <strong>{subsystem.name}</strong>
                        <span>
                          {subsystem.completeCount}/{subsystem.taskCount} complete
                        </span>
                      </button>
                      {timeline.days.map((day) => (
                        <div
                          className="timeline-day-slot subsystem-slot"
                          key={`${subsystem.id}-${day}`}
                        />
                      ))}
                    </div>
                    {!collapsed &&
                      subsystem.tasks.map((task) => (
                        <div
                          className="timeline-grid task-timeline-row"
                          key={task.id}
                          style={{
                            gridTemplateColumns: `220px repeat(${timeline.days.length}, minmax(34px, 1fr))`,
                          }}
                        >
                          <div className="task-label">
                            <strong>{task.title}</strong>
                            <span>
                              {membersById[task.ownerId]?.name ?? "Unassigned"} /{" "}
                              {membersById[task.mentorId]?.name ?? "No mentor"}
                            </span>
                          </div>
                          {timeline.days.map((day) => (
                            <div className="timeline-day-slot" key={`${task.id}-${day}`} />
                          ))}
                          <button
                            className={`timeline-bar timeline-${task.status}`}
                            onClick={() => openEditTaskModal(task)}
                            style={{ gridColumn: `${task.offset + 2} / span ${task.span}` }}
                            type="button"
                          >
                            {task.title}
                          </button>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="section-copy">Create a task to populate the subsystem timeline.</p>
          )}
        </section>
      ) : null}

      {activeTab === "queue" ? (
        <section className="panel dense-panel">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">Execution</p>
              <h2>Task queue</h2>
            </div>
            <div className="panel-actions">
              <button className="primary-action" onClick={openCreateTaskModal} type="button">
                New task
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="queue-table queue-table-header">
              <span>Task</span>
              <span>Subsystem</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Due</span>
              <span>Priority</span>
            </div>
            {bootstrap.tasks.map((task) => (
              <button
                className="queue-table queue-row"
                key={task.id}
                onClick={() => openEditTaskModal(task)}
                type="button"
              >
                <span className="queue-title">
                  <strong>{task.title}</strong>
                  <small>{task.summary}</small>
                </span>
                <span>{subsystemsById[task.subsystemId]?.name ?? "Unknown"}</span>
                <span>{membersById[task.ownerId]?.name ?? "Unassigned"}</span>
                <span className={`pill status-${task.status}`}>{task.status}</span>
                <span>{formatDate(task.dueDate)}</span>
                <span className={`pill priority-${task.priority}`}>{task.priority}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "purchases" ? (
        <section className="panel dense-panel">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">Procurement</p>
              <h2>Purchase list</h2>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Estimated</span>
                  <strong>{formatCurrency(purchaseSummary.totalEstimated)}</strong>
                </div>
                <div className="mini-chip">
                  <span>Delivered</span>
                  <strong>{purchaseSummary.delivered}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={openCreatePurchaseModal}
                type="button"
              >
                Add purchase
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header purchase-table">
              <span>Item</span>
              <span>Vendor</span>
              <span>Qty</span>
              <span>Status</span>
              <span>Mentor</span>
              <span>Est.</span>
              <span>Final</span>
            </div>
            {bootstrap.purchaseItems.map((item) => (
              <button
                className="ops-table ops-row purchase-table ops-button-row"
                key={item.id}
                onClick={() => openEditPurchaseModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.vendor}</span>
                <span>{item.quantity}</span>
                <span className={`pill purchase-${item.status}`}>{item.status}</span>
                <span>{item.approvedByMentor ? "Approved" : "Waiting"}</span>
                <span>{formatCurrency(item.estimatedCost)}</span>
                <span>{formatCurrency(item.finalCost)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "cnc" ? (
        <section className="panel dense-panel">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">Manufacturing</p>
              <h2>CNC queue</h2>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Open jobs</span>
                  <strong>{cncItems.length}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={() => openCreateManufacturingModal("cnc")}
                type="button"
              >
                Add CNC job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table">
              <span>Part</span>
              <span>Material</span>
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              <span>Status</span>
              <span>Mentor</span>
            </div>
            {cncItems.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.material}</span>
                <span>{item.quantity}</span>
                <span>{item.batchLabel ?? "Unbatched"}</span>
                <span>{formatDate(item.dueDate)}</span>
                <span className={`pill manufacturing-${item.status}`}>{item.status}</span>
                <span>{item.mentorReviewed ? "Reviewed" : "Pending"}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "prints" ? (
        <section className="panel dense-panel">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">Manufacturing</p>
              <h2>3D print queue</h2>
            </div>
            <div className="panel-actions">
              <div className="mini-summary-row">
                <div className="mini-chip">
                  <span>Open jobs</span>
                  <strong>{printItems.length}</strong>
                </div>
              </div>
              <button
                className="primary-action"
                onClick={() => openCreateManufacturingModal("3d-print")}
                type="button"
              >
                Add print job
              </button>
            </div>
          </div>
          <div className="table-shell">
            <div className="ops-table ops-table-header manufacturing-table">
              <span>Part</span>
              <span>Material</span>
              <span>Qty</span>
              <span>Batch</span>
              <span>Due</span>
              <span>Status</span>
              <span>Mentor</span>
            </div>
            {printItems.map((item) => (
              <button
                className="ops-table ops-row manufacturing-table ops-button-row"
                key={item.id}
                onClick={() => openEditManufacturingModal(item)}
                type="button"
              >
                <span className="queue-title">
                  {renderItemMeta(item, membersById, subsystemsById)}
                </span>
                <span>{item.material}</span>
                <span>{item.quantity}</span>
                <span>{item.batchLabel ?? "Unbatched"}</span>
                <span>{formatDate(item.dueDate)}</span>
                <span className={`pill manufacturing-${item.status}`}>{item.status}</span>
                <span>{item.mentorReviewed ? "Reviewed" : "Pending"}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "roster" ? (
        <section className="panel dense-panel roster-layout">
          <div className="panel-header compact-header">
            <div>
              <p className="eyebrow">People</p>
              <h2>Roster editor</h2>
            </div>
          </div>
          <div className="roster-columns">
            <div className="panel-subsection">
              <h3>Current roster</h3>
              <div className="roster-list">
                {bootstrap.members.map((member) => (
                  <button
                    className={member.id === selectedMemberId ? "member-row active" : "member-row"}
                    key={member.id}
                    onClick={() => selectMember(member.id, bootstrap)}
                    type="button"
                  >
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-subsection">
              <form className="compact-form" onSubmit={handleCreateMember}>
                <h3>Add person</h3>
                <label className="field">
                  <span>Name</span>
                  <input
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                    value={memberForm.name}
                  />
                </label>
                <label className="field">
                  <span>Role</span>
                  <select
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        role: event.target.value as MemberPayload["role"],
                      }))
                    }
                    value={memberForm.role}
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <button className="primary-action" disabled={isSavingMember} type="submit">
                  {isSavingMember ? "Saving..." : "Add person"}
                </button>
              </form>

              {memberEditDraft ? (
                <form className="compact-form" onSubmit={handleUpdateMember}>
                  <h3>Edit selected person</h3>
                  <label className="field">
                    <span>Name</span>
                    <input
                      onChange={(event) =>
                        setMemberEditDraft((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      value={memberEditDraft.name}
                    />
                  </label>
                  <label className="field">
                    <span>Role</span>
                    <select
                      onChange={(event) =>
                        setMemberEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                role: event.target.value as MemberPayload["role"],
                              }
                            : current,
                        )
                      }
                      value={memberEditDraft.role}
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <button className="secondary-action" disabled={isSavingMember} type="submit">
                    {isSavingMember ? "Saving..." : "Update person"}
                  </button>
                </form>
              ) : (
                <div className="empty-state">
                  <p>Select someone from the roster to edit their role or name.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {taskModalMode ? (
        <div className="modal-scrim" role="presentation">
          <section aria-modal="true" className="modal-card" role="dialog">
            <div className="panel-header compact-header">
              <div>
                <p className="eyebrow">Task editor</p>
                <h2>{taskModalMode === "create" ? "Create task" : activeTask?.title ?? "Edit task"}</h2>
              </div>
              <button className="icon-button" onClick={closeTaskModal} type="button">
                Close
              </button>
            </div>
            <form className="modal-form" onSubmit={handleTaskSubmit}>
              <label className="field modal-wide">
                <span>Title</span>
                <input
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                  value={taskDraft.title}
                />
              </label>
              <label className="field modal-wide">
                <span>Summary</span>
                <textarea
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, summary: event.target.value }))
                  }
                  required
                  rows={3}
                  value={taskDraft.summary}
                />
              </label>
              <label className="field">
                <span>Subsystem</span>
                <select
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, subsystemId: event.target.value }))
                  }
                  value={taskDraft.subsystemId}
                >
                  {bootstrap.subsystems.map((subsystem) => (
                    <option key={subsystem.id} value={subsystem.id}>
                      {subsystem.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Owner</span>
                <select
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, ownerId: event.target.value }))
                  }
                  value={taskDraft.ownerId}
                >
                  {students.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Mentor</span>
                <select
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, mentorId: event.target.value }))
                  }
                  value={taskDraft.mentorId}
                >
                  {mentors.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  onChange={(event) =>
                    setTaskDraft((current) => ({
                      ...current,
                      status: event.target.value as TaskPayload["status"],
                    }))
                  }
                  value={taskDraft.status}
                >
                  <option value="not-started">Not started</option>
                  <option value="in-progress">In progress</option>
                  <option value="waiting-for-qa">Waiting for QA</option>
                  <option value="complete">Complete</option>
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select
                  onChange={(event) =>
                    setTaskDraft((current) => ({
                      ...current,
                      priority: event.target.value as TaskPayload["priority"],
                    }))
                  }
                  value={taskDraft.priority}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label className="field">
                <span>Start date</span>
                <input
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, startDate: event.target.value }))
                  }
                  type="date"
                  value={taskDraft.startDate}
                />
              </label>
              <label className="field">
                <span>Due date</span>
                <input
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  type="date"
                  value={taskDraft.dueDate}
                />
              </label>
              <label className="field">
                <span>Estimated hours</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setTaskDraft((current) => ({
                      ...current,
                      estimatedHours: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={taskDraft.estimatedHours}
                />
              </label>
              <label className="field">
                <span>Actual hours</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setTaskDraft((current) => ({
                      ...current,
                      actualHours: Number(event.target.value),
                    }))
                  }
                  step="0.5"
                  type="number"
                  value={taskDraft.actualHours}
                />
              </label>
              <label className="field modal-wide">
                <span>Blockers</span>
                <input
                  onChange={(event) => setTaskDraftBlockers(event.target.value)}
                  placeholder="Comma-separated blockers"
                  value={taskDraftBlockers}
                />
              </label>
              <div className="checkbox-row modal-wide">
                <label className="checkbox-field">
                  <input
                    checked={taskDraft.requiresDocumentation}
                    onChange={(event) =>
                      setTaskDraft((current) => ({
                        ...current,
                        requiresDocumentation: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Requires documentation</span>
                </label>
                <label className="checkbox-field">
                  <input
                    checked={taskDraft.documentationLinked}
                    onChange={(event) =>
                      setTaskDraft((current) => ({
                        ...current,
                        documentationLinked: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Documentation linked</span>
                </label>
              </div>
              <div className="modal-actions modal-wide">
                <button className="secondary-action" onClick={closeTaskModal} type="button">
                  Cancel
                </button>
                <button className="primary-action" disabled={isSavingTask} type="submit">
                  {isSavingTask
                    ? "Saving..."
                    : taskModalMode === "create"
                      ? "Create task"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {purchaseModalMode ? (
        <div className="modal-scrim" role="presentation">
          <section aria-modal="true" className="modal-card" role="dialog">
            <div className="panel-header compact-header">
              <div>
                <p className="eyebrow">Purchase editor</p>
                <h2>
                  {purchaseModalMode === "create"
                    ? "Add purchase"
                    : "Edit purchase"}
                </h2>
              </div>
              <button className="icon-button" onClick={closePurchaseModal} type="button">
                Close
              </button>
            </div>
            <form className="modal-form" onSubmit={handlePurchaseSubmit}>
              <label className="field modal-wide">
                <span>Title</span>
                <input
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  value={purchaseDraft.title}
                />
              </label>
              <label className="field">
                <span>Subsystem</span>
                <select
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      subsystemId: event.target.value,
                    }))
                  }
                  value={purchaseDraft.subsystemId}
                >
                  {bootstrap.subsystems.map((subsystem) => (
                    <option key={subsystem.id} value={subsystem.id}>
                      {subsystem.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Requester</span>
                <select
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      requestedById: event.target.value,
                    }))
                  }
                  value={purchaseDraft.requestedById}
                >
                  {bootstrap.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Vendor</span>
                <input
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      vendor: event.target.value,
                    }))
                  }
                  required
                  value={purchaseDraft.vendor}
                />
              </label>
              <label className="field">
                <span>Link label</span>
                <input
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      linkLabel: event.target.value,
                    }))
                  }
                  required
                  value={purchaseDraft.linkLabel}
                />
              </label>
              <label className="field">
                <span>Quantity</span>
                <input
                  min="1"
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      quantity: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={purchaseDraft.quantity}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      status: event.target.value as PurchaseItemPayload["status"],
                    }))
                  }
                  value={purchaseDraft.status}
                >
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="purchased">Purchased</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </label>
              <label className="field">
                <span>Estimated cost</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setPurchaseDraft((current) => ({
                      ...current,
                      estimatedCost: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={purchaseDraft.estimatedCost}
                />
              </label>
              <label className="field">
                <span>Final cost</span>
                <input
                  min="0"
                  onChange={(event) => setPurchaseFinalCost(event.target.value)}
                  placeholder="Optional"
                  type="number"
                  value={purchaseFinalCost}
                />
              </label>
              <div className="checkbox-row modal-wide">
                <label className="checkbox-field">
                  <input
                    checked={purchaseDraft.approvedByMentor}
                    onChange={(event) =>
                      setPurchaseDraft((current) => ({
                        ...current,
                        approvedByMentor: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Mentor approved</span>
                </label>
              </div>
              <div className="modal-actions modal-wide">
                <button className="secondary-action" onClick={closePurchaseModal} type="button">
                  Cancel
                </button>
                <button className="primary-action" disabled={isSavingPurchase} type="submit">
                  {isSavingPurchase
                    ? "Saving..."
                    : purchaseModalMode === "create"
                      ? "Add purchase"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {manufacturingModalMode ? (
        <div className="modal-scrim" role="presentation">
          <section aria-modal="true" className="modal-card" role="dialog">
            <div className="panel-header compact-header">
              <div>
                <p className="eyebrow">Manufacturing editor</p>
                <h2>
                  {manufacturingModalMode === "create"
                    ? manufacturingDraft.process === "cnc"
                      ? "Add CNC job"
                      : "Add 3D print job"
                    : "Edit manufacturing job"}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={closeManufacturingModal}
                type="button"
              >
                Close
              </button>
            </div>
            <form className="modal-form" onSubmit={handleManufacturingSubmit}>
              <label className="field modal-wide">
                <span>Title</span>
                <input
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  value={manufacturingDraft.title}
                />
              </label>
              <label className="field">
                <span>Subsystem</span>
                <select
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      subsystemId: event.target.value,
                    }))
                  }
                  value={manufacturingDraft.subsystemId}
                >
                  {bootstrap.subsystems.map((subsystem) => (
                    <option key={subsystem.id} value={subsystem.id}>
                      {subsystem.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Requester</span>
                <select
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      requestedById: event.target.value,
                    }))
                  }
                  value={manufacturingDraft.requestedById}
                >
                  {bootstrap.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Process</span>
                <select
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      process: event.target.value as ManufacturingItemPayload["process"],
                    }))
                  }
                  value={manufacturingDraft.process}
                >
                  <option value="cnc">CNC</option>
                  <option value="3d-print">3D print</option>
                  <option value="fabrication">Fabrication</option>
                </select>
              </label>
              <label className="field">
                <span>Due date</span>
                <input
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={manufacturingDraft.dueDate}
                />
              </label>
              <label className="field">
                <span>Material</span>
                <input
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      material: event.target.value,
                    }))
                  }
                  required
                  value={manufacturingDraft.material}
                />
              </label>
              <label className="field">
                <span>Quantity</span>
                <input
                  min="1"
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      quantity: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={manufacturingDraft.quantity}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      status: event.target.value as ManufacturingItemPayload["status"],
                    }))
                  }
                  value={manufacturingDraft.status}
                >
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In progress</option>
                  <option value="qa">QA</option>
                  <option value="complete">Complete</option>
                </select>
              </label>
              <label className="field">
                <span>Batch label</span>
                <input
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      batchLabel: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  value={manufacturingDraft.batchLabel ?? ""}
                />
              </label>
              <div className="checkbox-row modal-wide">
                <label className="checkbox-field">
                  <input
                    checked={manufacturingDraft.mentorReviewed}
                    onChange={(event) =>
                      setManufacturingDraft((current) => ({
                        ...current,
                        mentorReviewed: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Mentor reviewed</span>
                </label>
              </div>
              <div className="modal-actions modal-wide">
                <button
                  className="secondary-action"
                  onClick={closeManufacturingModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="primary-action"
                  disabled={isSavingManufacturing}
                  type="submit"
                >
                  {isSavingManufacturing
                    ? "Saving..."
                    : manufacturingModalMode === "create"
                      ? "Add job"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
