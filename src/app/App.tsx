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
import { GoogleSignInScreen, AuthStatusScreen } from "../components/auth/AuthScreens";
import { AppSidebar } from "../components/layout/AppSidebar";
import { AppTopbar } from "../components/layout/AppTopbar";
import {
  Icon3DPrint, IconCnc, IconManufacturing, IconParts, IconPurchases, IconRoster, IconTasks
} from "../components/shared/Icons";
import { WorkspaceContent } from "../components/workspace/WorkspaceContent";
import {
  ManufacturingEditorModal,
  MaterialEditorModal,
  PartDefinitionEditorModal,
  PurchaseEditorModal,
  TaskEditorModal,
} from "../components/workspace/WorkspaceModals";
import {
  buildEmptyManufacturingPayload, buildEmptyMaterialPayload, buildEmptyPartDefinitionPayload, buildEmptyPurchasePayload, buildEmptyTaskPayload, joinList, manufacturingToPayload, materialToPayload, partDefinitionToPayload, purchaseToPayload, splitList, taskToPayload, toErrorMessage
} from "../lib/appUtils";
import {
  clearStoredSessionToken,
  createManufacturingItemRecord,
  createMaterialRecord,
  createMemberRecord,
  createPartDefinitionRecord,
  createPurchaseItemRecord,
  createTask,
  deleteMaterialRecord,
  deleteMemberRecord,
  deletePartDefinitionRecord,
  exchangeGoogleCredential,
  fetchAuthConfig,
  fetchBootstrap,
  fetchCurrentUser,
  isLocalGoogleAuthHost,
  isUsingLocalGoogleClientIdOverride,
  loadGoogleIdentityScript,
  loadStoredSessionToken,
  resolveGoogleClientId,
  signOutFromGoogle,
  storeSessionToken,
  type AuthConfig,
  type GoogleCredentialResponse,
  type SessionUser,
  updateManufacturingItemRecord,
  updateMaterialRecord,
  updateMemberRecord,
  updatePartDefinitionRecord,
  updatePurchaseItemRecord,
  updateTaskRecord,
  validateSession,
} from "../lib/auth";
import type {
  BootstrapPayload,
  ManufacturingItemPayload,
  ManufacturingItemRecord,
  MaterialPayload,
  MaterialRecord,
  MemberPayload,
  PartDefinitionPayload,
  PartDefinitionRecord,
  PurchaseItemPayload,
  PurchaseItemRecord,
  TaskPayload,
  TaskRecord,
} from "../types";

type ViewTab = "timeline" | "queue" | "purchases" | "cnc" | "prints" | "materials" | "parts" | "roster";
type TaskModalMode = "create" | "edit" | null;
type PurchaseModalMode = "create" | "edit" | null;
type ManufacturingModalMode = "create" | "edit" | null;
type MaterialModalMode = "create" | "edit" | null;
type PartDefinitionModalMode = "create" | "edit" | null;

const EMPTY_BOOTSTRAP: BootstrapPayload = {
  members: [],
  subsystems: [],
  disciplines: [],
  mechanisms: [],
  requirements: [],
  materials: [],
  partDefinitions: [],
  partInstances: [],
  events: [],
  tasks: [],
  purchaseItems: [],
  manufacturingItems: [],
};

function renderItemMeta(
  item: PurchaseItemRecord | ManufacturingItemRecord,
  membersById: Record<string, BootstrapPayload["members"][number]>,
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>,
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <strong style={{ color: "var(--text-title)" }}>{item.title}</strong>
      <small style={{ color: "var(--text-copy)" }}>
        {(item.subsystemId ? subsystemsById[item.subsystemId]?.name : null) ?? "Unknown subsystem"} /{" "}
        {(item.requestedById ? membersById[item.requestedById]?.name : null) ?? "Unassigned"}
      </small>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>("timeline");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("meco-theme") === "dark";
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("meco-theme", next ? "dark" : "light");
      return next;
    });
  };

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

  const [materialModalMode, setMaterialModalMode] = useState<MaterialModalMode>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [materialDraft, setMaterialDraft] = useState<MaterialPayload>(
    buildEmptyMaterialPayload(),
  );
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

  const [partDefinitionModalMode, setPartDefinitionModalMode] =
    useState<PartDefinitionModalMode>(null);
  const [activePartDefinitionId, setActivePartDefinitionId] = useState<string | null>(
    null,
  );
  const [partDefinitionDraft, setPartDefinitionDraft] =
    useState<PartDefinitionPayload>(buildEmptyPartDefinitionPayload(EMPTY_BOOTSTRAP));
  const [isSavingPartDefinition, setIsSavingPartDefinition] = useState(false);
  const [isDeletingPartDefinition, setIsDeletingPartDefinition] = useState(false);

  const [activePersonFilter, setActivePersonFilter] = useState<string>("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberPayload>({
    name: "",
    role: "student",
  });
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [memberEditDraft, setMemberEditDraft] = useState<MemberPayload | null>(
    null,
  );
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const students = useMemo(
    () => bootstrap.members.filter((member) => member.role === "student"),
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
  const disciplinesById = useMemo(
    () => Object.fromEntries(bootstrap.disciplines.map((discipline) => [discipline.id, discipline])),
    [bootstrap.disciplines],
  );
  const mechanismsById = useMemo(
    () => Object.fromEntries(bootstrap.mechanisms.map((mechanism) => [mechanism.id, mechanism])),
    [bootstrap.mechanisms],
  );
  const requirementsById = useMemo(
    () => Object.fromEntries(bootstrap.requirements.map((requirement) => [requirement.id, requirement])),
    [bootstrap.requirements],
  );
  const partDefinitionsById = useMemo(
    () => Object.fromEntries(bootstrap.partDefinitions.map((partDefinition) => [partDefinition.id, partDefinition])),
    [bootstrap.partDefinitions],
  );
  const partInstancesById = useMemo(
    () => Object.fromEntries(bootstrap.partInstances.map((partInstance) => [partInstance.id, partInstance])),
    [bootstrap.partInstances],
  );
  const eventsById = useMemo(
    () => Object.fromEntries(bootstrap.events.map((event) => [event.id, event])),
    [bootstrap.events],
  );
  const activeTask = useMemo(
    () => bootstrap.tasks.find((task) => task.id === activeTaskId) ?? null,
    [bootstrap.tasks, activeTaskId],
  );

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
  const googleClientId = resolveGoogleClientId(authConfig);
  const hostedDomain = enforcedAuthConfig?.hostedDomain ?? "";
  const isLocalGoogleOverrideActive = isUsingLocalGoogleClientIdOverride();
  const isLocalGoogleDevHost = isLocalGoogleAuthHost();
  const navigationItems = [
    {
      value: "timeline" as ViewTab,
      label: "Timeline",
      icon: <IconTasks />,
      count: bootstrap.tasks.length,
    },
    {
      value: "queue" as ViewTab,
      label: "Task queue",
      icon: <IconTasks />,
      count: bootstrap.tasks.length,
    },
    {
      value: "purchases" as ViewTab,
      label: "Purchases",
      icon: <IconPurchases />,
      count: bootstrap.purchaseItems.length,
    },
    {
      value: "cnc" as ViewTab,
      label: "CNC",
      icon: <IconCnc />,
      count: cncItems.length,
    },
    {
      value: "prints" as ViewTab,
      label: "3D print",
      icon: <Icon3DPrint />,
      count: printItems.length,
    },
    {
      value: "roster" as ViewTab,
      label: "Roster editor",
      icon: <IconRoster />,
      count: bootstrap.members.length,
    },
    {
      value: "materials" as ViewTab,
      label: "Materials",
      icon: <IconManufacturing />,
      count: bootstrap.materials.length,
    },
    {
      value: "parts" as ViewTab,
      label: "Parts",
      icon: <IconParts />,
      count: bootstrap.partDefinitions.length + bootstrap.partInstances.length,
    },
  ];

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
      const payload = await fetchBootstrap(
        activePersonFilter === "all" ? null : activePersonFilter,
        handleUnauthorized,
      );
      const nextMemberId =
        selectedMemberId && payload.members.some((member) => member.id === selectedMemberId)
          ? selectedMemberId
          : payload.members[0]?.id ?? null;

      startTransition(() => {
        setBootstrap(payload);
      });

      if (
        activePersonFilter !== "all" &&
        !payload.members.some((member) => member.id === activePersonFilter)
      ) {
        setActivePersonFilter("all");
      }

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

      if (materialModalMode === "create") {
        setMaterialDraft(buildEmptyMaterialPayload());
      }

      if (materialModalMode === "edit" && activeMaterialId) {
        const nextItem = payload.materials.find((item) => item.id === activeMaterialId);
        if (nextItem) {
          setMaterialDraft(materialToPayload(nextItem));
        } else {
          setMaterialModalMode(null);
          setActiveMaterialId(null);
        }
      }

      if (partDefinitionModalMode === "create") {
        setPartDefinitionDraft(buildEmptyPartDefinitionPayload(payload));
      }

      if (partDefinitionModalMode === "edit" && activePartDefinitionId) {
        const nextItem = payload.partDefinitions.find(
          (item) => item.id === activePartDefinitionId,
        );
        if (nextItem) {
          setPartDefinitionDraft(partDefinitionToPayload(nextItem));
        } else {
          setPartDefinitionModalMode(null);
          setActivePartDefinitionId(null);
        }
      }

    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsLoadingData(false);
    }
  }, [
    activeManufacturingId,
    activeMaterialId,
    activePartDefinitionId,
    activePersonFilter,
    activePurchaseId,
    activeTaskId,
    manufacturingModalMode,
    materialModalMode,
    partDefinitionModalMode,
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

  const openCreateMaterialModal = () => {
    setActiveMaterialId(null);
    setMaterialDraft(buildEmptyMaterialPayload());
    setMaterialModalMode("create");
  };

  const openEditMaterialModal = (item: MaterialRecord) => {
    setActiveMaterialId(item.id);
    setMaterialDraft(materialToPayload(item));
    setMaterialModalMode("edit");
  };

  const closeMaterialModal = () => {
    setMaterialModalMode(null);
    setActiveMaterialId(null);
  };

  const openCreatePartDefinitionModal = () => {
    setActivePartDefinitionId(null);
    setPartDefinitionDraft(buildEmptyPartDefinitionPayload(bootstrap));
    setPartDefinitionModalMode("create");
  };

  const openEditPartDefinitionModal = (item: PartDefinitionRecord) => {
    setActivePartDefinitionId(item.id);
    setPartDefinitionDraft(partDefinitionToPayload(item));
    setPartDefinitionModalMode("edit");
  };

  const closePartDefinitionModal = () => {
    setPartDefinitionModalMode(null);
    setActivePartDefinitionId(null);
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
          hd: hostedDomain || undefined,
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

  const handleMaterialSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingMaterial(true);
    setDataMessage(null);

    try {
      if (materialModalMode === "create") {
        await createMaterialRecord(materialDraft, handleUnauthorized);
      } else if (materialModalMode === "edit" && activeMaterialId) {
        await updateMaterialRecord(activeMaterialId, materialDraft, handleUnauthorized);
      }

      await loadWorkspace();
      closeMaterialModal();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    setIsDeletingMaterial(true);
    setDataMessage(null);

    try {
      await deleteMaterialRecord(materialId, handleUnauthorized);
      if (activeMaterialId === materialId) {
        closeMaterialModal();
      }
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsDeletingMaterial(false);
    }
  };

  const handlePartDefinitionSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSavingPartDefinition(true);
    setDataMessage(null);

    try {
      if (partDefinitionModalMode === "create") {
        await createPartDefinitionRecord(partDefinitionDraft, handleUnauthorized);
      } else if (partDefinitionModalMode === "edit" && activePartDefinitionId) {
        await updatePartDefinitionRecord(
          activePartDefinitionId,
          partDefinitionDraft,
          handleUnauthorized,
        );
      }

      await loadWorkspace();
      closePartDefinitionModal();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingPartDefinition(false);
    }
  };

  const handleDeletePartDefinition = async (partDefinitionId: string) => {
    setIsDeletingPartDefinition(true);
    setDataMessage(null);

    try {
      await deletePartDefinitionRecord(partDefinitionId, handleUnauthorized);
      if (activePartDefinitionId === partDefinitionId) {
        closePartDefinitionModal();
      }
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsDeletingPartDefinition(false);
    }
  };

  const handleCreateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingMember(true);
    setDataMessage(null);

    try {
      await createMemberRecord(memberForm, handleUnauthorized);
      setMemberForm({ name: "", role: "student" });
      setIsAddPersonOpen(false);
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
      setIsEditPersonOpen(false);
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!memberId) {
      return;
    }

    setIsDeletingMember(true);
    setDataMessage(null);

    try {
      await deleteMemberRecord(memberId, handleUnauthorized);
      if (activePersonFilter === memberId) {
        setActivePersonFilter("all");
      }
      if (selectedMemberId === memberId) {
        setSelectedMemberId(null);
        setMemberEditDraft(null);
        setIsEditPersonOpen(false);
      }
      await loadWorkspace();
    } catch (error) {
      setDataMessage(toErrorMessage(error));
    } finally {
      setIsDeletingMember(false);
    }
  };

  if (authBooting) {
    return (
      <AuthStatusScreen
        body="Checking the server-side auth configuration before the workspace opens."
        title="Loading sign-in requirements for MECO Robotics."
      />
    );
  }

  if (!authConfig) {
    return (
      <AuthStatusScreen
        body="The app could not confirm the server-side sign-in rules, so access is paused until the API is reachable again."
        message={authMessage}
        title="Couldn&apos;t load the authentication configuration."
      />
    );
  }

  if (enforcedAuthConfig && !sessionUser) {
    return (
      <GoogleSignInScreen
        authMessage={authMessage}
        googleButtonRef={googleButtonRef}
        isLocalGoogleDevHost={isLocalGoogleDevHost}
        isLocalGoogleOverrideActive={isLocalGoogleOverrideActive}
        isSigningIn={isSigningIn}
        signInConfig={enforcedAuthConfig}
      />
    );
  }

  return (
    <main
      className={`page-shell ${isDarkMode ? "dark-mode" : ""}`}
      style={{
        transition: "padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        paddingTop: "64px",
        paddingLeft: isSidebarCollapsed ? "64px" : "240px",
        paddingRight: 0,
        margin: 0,
        maxWidth: "none",
        width: "100%",
        boxSizing: "border-box",
        "--bg-panel": isDarkMode ? "#1e293b" : "#ffffff",
        "--border-base": isDarkMode ? "#334155" : "#e5e7eb",
        "--text-title": isDarkMode ? "#f8fafc" : "#000000",
        "--text-copy": isDarkMode ? "#e2e8f0" : "#64748b",
        "--meco-blue": isDarkMode ? "#3b82f6" : "#16478e",
        "--meco-soft-blue": isDarkMode ? "#1e3a8a" : "#eff6ff",
        "--bg-row-alt": isDarkMode ? "#0f172a" : "#f8fafc",
        "--official-black": isDarkMode ? "#f8fafc" : "#000000",
        "--status-success-bg": isDarkMode ? "#064e3b" : "#dcfce7",
        "--status-success-text": isDarkMode ? "#34d399" : "#166534",
        "--status-info-bg": isDarkMode ? "#082f49" : "#e0f2fe",
        "--status-info-text": isDarkMode ? "#38bdf8" : "#075985",
        "--status-warning-bg": isDarkMode ? "#451a03" : "#fef3c7",
        "--status-warning-text": isDarkMode ? "#fbbf24" : "#92400e",
        "--status-danger-bg": isDarkMode ? "#450a0a" : "#fee2e2",
        "--status-danger-text": isDarkMode ? "#f87171" : "#991b1b",
        "--status-neutral-bg": isDarkMode ? "#1e293b" : "#f1f5f9",
        "--status-neutral-text": isDarkMode ? "#94a3b8" : "#475569",
        colorScheme: isDarkMode ? "dark" : "light",
      } as React.CSSProperties}
    >
      <AppTopbar
        handleSignOut={handleSignOut}
        isLoadingData={isLoadingData}
        loadWorkspace={loadWorkspace}
        sessionUser={sessionUser}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <AppSidebar
        activeTab={activeTab}
        items={navigationItems}
        onSelectTab={(tab) => setActiveTab(tab as ViewTab)}
        isCollapsed={isSidebarCollapsed}
      />

      <WorkspaceContent
        activePersonFilter={activePersonFilter}
        activeTab={activeTab}
        bootstrap={bootstrap}
        cncItems={cncItems}
        dataMessage={dataMessage}
        handleCreateMember={handleCreateMember}
        handleDeleteMember={handleDeleteMember}
        handleUpdateMember={handleUpdateMember}
        isAddPersonOpen={isAddPersonOpen}
        isDeletingMember={isDeletingMember}
        isEditPersonOpen={isEditPersonOpen}
        isLoadingData={isLoadingData}
        isSavingMember={isSavingMember}
        memberEditDraft={memberEditDraft}
        memberForm={memberForm}
        membersById={membersById}
        openCreateManufacturingModal={openCreateManufacturingModal}
        openCreateMaterialModal={openCreateMaterialModal}
        openCreatePartDefinitionModal={openCreatePartDefinitionModal}
        openCreatePurchaseModal={openCreatePurchaseModal}
        openCreateTaskModal={openCreateTaskModal}
        openEditManufacturingModal={openEditManufacturingModal}
        openEditMaterialModal={openEditMaterialModal}
        openEditPartDefinitionModal={openEditPartDefinitionModal}
        openEditPurchaseModal={openEditPurchaseModal}
        openEditTaskModal={openEditTaskModal}
        handleDeleteMaterial={handleDeleteMaterial}
        handleDeletePartDefinition={handleDeletePartDefinition}
        isDeletingMaterial={isDeletingMaterial}
        isDeletingPartDefinition={isDeletingPartDefinition}
        printItems={printItems}
        renderItemMeta={renderItemMeta}
        rosterMentors={rosterMentors}
        selectMember={selectMember}
        selectedMemberId={selectedMemberId}
        setIsAddPersonOpen={setIsAddPersonOpen}
        setIsEditPersonOpen={setIsEditPersonOpen}
        setMemberEditDraft={setMemberEditDraft}
        setMemberForm={setMemberForm}
        setActivePersonFilter={setActivePersonFilter}
        students={students}
        disciplinesById={disciplinesById}
        eventsById={eventsById}
        mechanismsById={mechanismsById}
        partDefinitionsById={partDefinitionsById}
        partInstancesById={partInstancesById}
        requirementsById={requirementsById}
        subsystemsById={subsystemsById}
      />

      {taskModalMode ? (
        <TaskEditorModal
          activeTask={activeTask}
          bootstrap={bootstrap}
          closeTaskModal={closeTaskModal}
          handleTaskSubmit={handleTaskSubmit}
          isSavingTask={isSavingTask}
          disciplinesById={disciplinesById}
          eventsById={eventsById}
          mechanismsById={mechanismsById}
          mentors={mentors}
          partDefinitionsById={partDefinitionsById}
          partInstancesById={partInstancesById}
          requirementsById={requirementsById}
          setTaskDraft={setTaskDraft}
          setTaskDraftBlockers={setTaskDraftBlockers}
          students={students}
          taskDraft={taskDraft}
          taskDraftBlockers={taskDraftBlockers}
          taskModalMode={taskModalMode}
        />
      ) : null}

      {purchaseModalMode ? (
        <PurchaseEditorModal
          bootstrap={bootstrap}
          closePurchaseModal={closePurchaseModal}
          handlePurchaseSubmit={handlePurchaseSubmit}
          isSavingPurchase={isSavingPurchase}
          purchaseDraft={purchaseDraft}
          purchaseFinalCost={purchaseFinalCost}
          purchaseModalMode={purchaseModalMode}
          setPurchaseDraft={setPurchaseDraft}
          setPurchaseFinalCost={setPurchaseFinalCost}
        />
      ) : null}

      {manufacturingModalMode ? (
        <ManufacturingEditorModal
          bootstrap={bootstrap}
          closeManufacturingModal={closeManufacturingModal}
          handleManufacturingSubmit={handleManufacturingSubmit}
          isSavingManufacturing={isSavingManufacturing}
          manufacturingDraft={manufacturingDraft}
          manufacturingModalMode={manufacturingModalMode}
          setManufacturingDraft={setManufacturingDraft}
        />
      ) : null}

      {materialModalMode ? (
        <MaterialEditorModal
          closeMaterialModal={closeMaterialModal}
          handleMaterialSubmit={handleMaterialSubmit}
          isSavingMaterial={isSavingMaterial}
          materialDraft={materialDraft}
          materialModalMode={materialModalMode}
          setMaterialDraft={setMaterialDraft}
        />
      ) : null}

      {partDefinitionModalMode ? (
        <PartDefinitionEditorModal
          bootstrap={bootstrap}
          closePartDefinitionModal={closePartDefinitionModal}
          handlePartDefinitionSubmit={handlePartDefinitionSubmit}
          isSavingPartDefinition={isSavingPartDefinition}
          partDefinitionDraft={partDefinitionDraft}
          partDefinitionModalMode={partDefinitionModalMode}
          setPartDefinitionDraft={setPartDefinitionDraft}
        />
      ) : null}
    </main>
  );
}
