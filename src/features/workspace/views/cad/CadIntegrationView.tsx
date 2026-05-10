import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import type { MechanismRecord, PartDefinitionRecord, SubsystemRecord } from "@/types/records";
import {
  applyCadSnapshotMappings,
  fetchCadSnapshotDiff,
  fetchCadSnapshotMappings,
  fetchCadSnapshots,
  fetchCadSnapshotSummary,
  fetchCadSnapshotTree,
  finalizeCadSnapshot,
  uploadCadStepFile,
} from "./api/cadStepApi";
import {
  createOnshapeDocumentRef,
  fetchOnshapeImportEstimate,
  fetchOnshapeOverview,
  runOnshapeImport,
} from "./api/onshapeCadApi";
import { CadDataPanels } from "./components/CadDataPanels";
import { CadLinkSyncPanel } from "./components/CadLinkSyncPanel";
import { CadStatusPanels } from "./components/CadStatusPanels";
import { CadStepReviewPanels } from "./components/CadStepReviewPanels";
import { CadStepUploadPanel } from "./components/CadStepUploadPanel";
import type {
  CadStepDiff,
  CadStepImportSummary,
  CadStepMappingRecord,
  CadStepSnapshotRecord,
  CadStepTreeNode,
  CadStepWarningRecord,
  OnshapeOverview,
  OnshapeSyncEstimate,
  SyncLevel,
} from "./model/cadIntegrationTypes";
import { parseOnshapeUrl } from "./model/onshapeUrlParser";
import "./cadIntegration.css";
import "./cadStepWorkflow.css";

const defaultOverview: OnshapeOverview = {
  connection: {
    authMode: "api_key",
    baseUrl: "https://cad.onshape.com",
    configured: false,
    credentialReference: null,
    lastError: null,
  },
  documentRefs: [],
  importRuns: [],
  snapshots: [],
  latestSnapshot: null,
  assemblyNodes: [],
  partDefinitions: [],
  partInstances: [],
  warnings: [],
  budget: {
    planType: "education",
    dailySoftBudget: 100,
    perSyncSoftBudget: 25,
    callsUsedToday: 0,
    callsUsedThisMonth: 0,
    callsUsedThisYear: 0,
    warningThresholdPercent: 70,
    hardStopThresholdPercent: 90,
    lastRateLimitRemaining: null,
  },
};

export function CadIntegrationView({
  mechanisms = [],
  partDefinitions = [],
  projectId,
  seasonId,
  subsystems = [],
}: {
  mechanisms?: MechanismRecord[];
  partDefinitions?: PartDefinitionRecord[];
  projectId?: string | null;
  seasonId?: string | null;
  subsystems?: SubsystemRecord[];
}) {
  const [overview, setOverview] = useState<OnshapeOverview>(defaultOverview);
  const [stepFile, setStepFile] = useState<File | null>(null);
  const [stepLabel, setStepLabel] = useState("Robot STEP iteration");
  const [cadSnapshots, setCadSnapshots] = useState<CadStepSnapshotRecord[]>([]);
  const [selectedCadSnapshotId, setSelectedCadSnapshotId] = useState("");
  const [stepSummary, setStepSummary] = useState<CadStepImportSummary | null>(null);
  const [stepTree, setStepTree] = useState<CadStepTreeNode[]>([]);
  const [stepMappings, setStepMappings] = useState<CadStepMappingRecord[]>([]);
  const [stepWarnings, setStepWarnings] = useState<CadStepWarningRecord[]>([]);
  const [stepDiff, setStepDiff] = useState<CadStepDiff | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("Robot master assembly");
  const [selectedDocumentRefId, setSelectedDocumentRefId] = useState("");
  const [syncLevel, setSyncLevel] = useState<SyncLevel>("bom");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploadingStep, setIsUploadingStep] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [syncEstimate, setSyncEstimate] = useState<OnshapeSyncEstimate | null>(null);

  const parsedUrl = useMemo(() => (url.trim() ? parseOnshapeUrl(url.trim()) : null), [url]);
  const selectedDocumentRef = overview.documentRefs.find((ref) => ref.id === selectedDocumentRefId) ?? null;
  const selectedReferenceType = selectedDocumentRef?.referenceType ?? parsedUrl?.referenceType ?? "unknown";
  const selectedCadSnapshot = cadSnapshots.find((snapshot) => snapshot.id === selectedCadSnapshotId) ?? null;

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const nextOverview = await fetchOnshapeOverview();
      setOverview(nextOverview);
      setSelectedDocumentRefId((current) => current || nextOverview.documentRefs[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCadSnapshotDetails = useCallback(async (snapshotId: string) => {
    const [summaryResponse, treeResponse, mappingsResponse, diffResponse] = await Promise.all([
      fetchCadSnapshotSummary(snapshotId),
      fetchCadSnapshotTree(snapshotId),
      fetchCadSnapshotMappings(snapshotId),
      fetchCadSnapshotDiff(snapshotId).catch(() => null),
    ]);
    setStepSummary(summaryResponse.summary);
    setStepTree(treeResponse.rootNodes);
    setStepMappings(mappingsResponse.items);
    setStepWarnings(diffResponse?.warnings ?? []);
    setStepDiff(diffResponse);
  }, []);

  const loadCadSnapshots = useCallback(async (preferredSnapshotId?: string) => {
    const response = await fetchCadSnapshots({ projectId, seasonId });
    setCadSnapshots(response.items);
    const nextSnapshotId = preferredSnapshotId || response.items[0]?.id || "";
    setSelectedCadSnapshotId(nextSnapshotId);
    if (nextSnapshotId) {
      await loadCadSnapshotDetails(nextSnapshotId);
    } else {
      setStepSummary(null);
      setStepTree([]);
      setStepMappings([]);
      setStepWarnings([]);
      setStepDiff(null);
    }
  }, [loadCadSnapshotDetails, projectId, seasonId]);

  useEffect(() => {
    void loadOverview();
    void loadCadSnapshots();
  }, [loadCadSnapshots]);

  useEffect(() => {
    if (!selectedDocumentRefId) {
      setSyncEstimate(null);
      return;
    }

    let isCurrent = true;
    fetchOnshapeImportEstimate({ documentRefId: selectedDocumentRefId, syncLevel })
      .then((response) => {
        if (isCurrent) {
          setSyncEstimate(response.item);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSyncEstimate(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedDocumentRefId, syncLevel]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parsedUrl?.ok) {
      setMessage("Paste a valid Onshape document URL first.");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const response = await createOnshapeDocumentRef({
        url: parsedUrl.originalUrl,
        label,
        projectId,
        seasonId,
      });
      await loadOverview();
      setSelectedDocumentRefId(response.item.id);
      setMessage(response.warnings.length ? response.warnings.join(" ") : "Onshape link saved without API calls.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    if (!selectedDocumentRefId) {
      setMessage("Select a saved Onshape reference first.");
      return;
    }

    setIsSyncing(true);
    setMessage(null);
    try {
      const response = await runOnshapeImport({ documentRefId: selectedDocumentRefId, syncLevel });
      await loadOverview();
      setMessage(
        `Sync ${response.result.status}: ${response.result.partDefinitionCount} part definitions, ${response.result.partInstanceCount} instances, ${response.result.warningCount} warnings.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      await loadOverview().catch(() => undefined);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStepUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepFile) {
      setMessage("Select a .step or .stp file first.");
      return;
    }

    setIsUploadingStep(true);
    setMessage(null);
    try {
      const response = await uploadCadStepFile({
        file: stepFile,
        label: stepLabel,
        projectId,
        seasonId,
      });
      await loadCadSnapshots(response.snapshot.id);
      setMessage(
        `STEP import ready for review: ${response.summary.assemblyCount} assemblies, ${response.summary.partDefinitionCount} part definitions, ${response.summary.warningCount} warnings.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsUploadingStep(false);
    }
  };

  const handleConfirmMapping = async (input: {
    mappingId: string;
    targetKind: CadStepMappingRecord["targetKind"];
    targetId: string | null;
    applyToFuture: boolean;
  }) => {
    if (!selectedCadSnapshotId) {
      return;
    }
    setIsSavingMapping(true);
    setMessage(null);
    try {
      await applyCadSnapshotMappings(selectedCadSnapshotId, {
        updates: [{
          mappingId: input.mappingId,
          targetKind: input.targetKind,
          targetId: input.targetId,
          confidence: "MANUAL",
          status: "CONFIRMED",
          applyToFuture: input.applyToFuture,
        }],
      });
      await loadCadSnapshotDetails(selectedCadSnapshotId);
      setMessage(input.applyToFuture ? "Mapping confirmed and saved for future STEP imports." : "Mapping confirmed for this snapshot.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingMapping(false);
    }
  };

  const handleFinalize = async (allowUnresolved: boolean) => {
    if (!selectedCadSnapshotId) {
      return;
    }
    setIsFinalizing(true);
    setMessage(null);
    try {
      await finalizeCadSnapshot(selectedCadSnapshotId, { allowUnresolved });
      await loadCadSnapshots(selectedCadSnapshotId);
      setMessage("CAD snapshot finalized.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <section className="panel dense-panel cad-integration-shell">
      <div className="panel-header compact-header cad-header">
        <div className="queue-section-header">
          <h2>CAD / STEP mapper</h2>
          <p className="section-copy">
            Detect STEP assembly structure, review mappings, and carry confirmed rules forward across iterations.
          </p>
        </div>
        <div className="cad-header-meta">
          <span>{isLoading ? "Refreshing CAD cache..." : "STEP-first workflow"}</span>
          <span>{selectedCadSnapshot ? `Last import ${new Date(selectedCadSnapshot.createdAt).toLocaleString()}` : "No STEP snapshot yet"}</span>
        </div>
      </div>

      {message ? <div className="cad-message" role="status">{message}</div> : null}

      <div className="cad-step-snapshot-bar">
        <label className="cad-field">
          <span>Snapshot</span>
          <select
            onChange={(event) => {
              setSelectedCadSnapshotId(event.target.value);
              if (event.target.value) {
                void loadCadSnapshotDetails(event.target.value);
              }
            }}
            value={selectedCadSnapshotId}
          >
            <option value="">No STEP snapshot selected</option>
            {cadSnapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>{snapshot.label}</option>
            ))}
          </select>
        </label>
      </div>

      <CadStepUploadPanel
        fileName={stepFile?.name ?? ""}
        isUploading={isUploadingStep}
        label={stepLabel}
        onFileChange={setStepFile}
        onLabelChange={setStepLabel}
        onSubmit={handleStepUpload}
      />

      <CadStepReviewPanels
        diff={stepDiff}
        isFinalizing={isFinalizing}
        isSavingMapping={isSavingMapping}
        mappings={stepMappings}
        onConfirmMapping={handleConfirmMapping}
        onFinalize={handleFinalize}
        snapshot={selectedCadSnapshot}
        summary={stepSummary}
        targets={{ subsystems, mechanisms, partDefinitions }}
        tree={stepTree}
        warnings={stepWarnings}
      />

      <CadStatusPanels
        overview={overview}
        selectedReferenceType={selectedReferenceType}
        selectedSyncLevel={syncLevel}
        syncEstimate={syncEstimate}
      />

      <CadLinkSyncPanel
        documentRefs={overview.documentRefs}
        isSaving={isSaving}
        isSyncing={isSyncing}
        label={label}
        onLabelChange={setLabel}
        onSave={handleSave}
        onSelectDocumentRef={setSelectedDocumentRefId}
        onSync={handleSync}
        onSyncLevelChange={setSyncLevel}
        onUrlChange={setUrl}
        parsedUrl={parsedUrl}
        selectedDocumentRefId={selectedDocumentRefId}
        syncLevel={syncLevel}
        url={url}
      />

      <CadDataPanels overview={overview} />
    </section>
  );
}
