export type OnshapeReferenceType = "workspace" | "version" | "microversion" | "unknown";
export type SyncLevel = "link_only" | "shallow" | "bom" | "deep_release";

export interface OnshapeUrlParseResult {
  ok: boolean;
  documentId?: string;
  workspaceId?: string;
  versionId?: string;
  microversionId?: string;
  elementId?: string;
  originalUrl: string;
  referenceType: OnshapeReferenceType;
  errors: string[];
}

export interface OnshapeDocumentRefRecord {
  id: string;
  label: string;
  documentId: string;
  workspaceId?: string | null;
  versionId?: string | null;
  microversionId?: string | null;
  elementId?: string | null;
  originalUrl: string;
  referenceType: OnshapeReferenceType;
  projectId?: string | null;
  seasonId?: string | null;
  subsystemId?: string | null;
  mechanismId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CadImportRunRecord {
  id: string;
  onshapeDocumentRefId: string;
  syncLevel: SyncLevel;
  status: "pending" | "running" | "completed" | "partial" | "failed" | "canceled";
  startedAt: string;
  completedAt: string | null;
  callsEstimated: number | null;
  callsUsed: number;
  stoppedReason: string | null;
  errorMessage: string | null;
}

export interface CadSnapshotRecord {
  id: string;
  label: string;
  onshapeDocumentRefId: string;
  importRunId: string;
  source: string;
  documentId: string;
  workspaceId: string | null;
  versionId: string | null;
  microversionId: string | null;
  elementId: string | null;
  immutable: boolean;
  createdAt: string;
  previousSnapshotId: string | null;
}

export interface CadAssemblyNodeRecord {
  id: string;
  snapshotId: string;
  parentAssemblyNodeId: string | null;
  instancePath: string;
  name: string;
  inferredType: string;
  subsystemId: string | null;
  mechanismId: string | null;
}

export interface CadPartDefinitionRecord {
  id: string;
  snapshotId: string;
  name: string;
  partNumber: string | null;
  material: string | null;
  configuration: string | null;
  missionControlExternalKey: string | null;
}

export interface CadPartInstanceRecord {
  id: string;
  snapshotId: string;
  cadPartDefinitionId: string | null;
  parentAssemblyNodeId: string | null;
  partId: string | null;
  instancePath: string;
  quantity: number;
  suppressed: boolean | null;
  configuration: string | null;
}

export interface CadImportWarningRecord {
  id: string;
  importRunId: string;
  snapshotId: string | null;
  severity: "info" | "warning" | "error";
  code: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface OnshapeApiBudgetRecord {
  planType: string;
  dailySoftBudget: number | null;
  perSyncSoftBudget: number | null;
  callsUsedToday: number;
  callsUsedThisMonth: number;
  callsUsedThisYear: number;
  warningThresholdPercent: number;
  hardStopThresholdPercent: number;
  lastRateLimitRemaining: number | null;
}

export interface OnshapeSyncEstimate {
  documentRefId: string;
  syncLevel: SyncLevel;
  callsEstimated: number;
  allowCached: boolean;
  requireFresh: boolean;
  immutableReference: boolean;
  referenceType: OnshapeReferenceType;
  cacheStatus: "not_required" | "hit" | "miss" | "stale";
  perSyncSoftBudget: number | null;
  budgetAllowsSync: boolean;
  warnings: string[];
}

export interface OnshapeOverview {
  connection: {
    authMode: "api_key" | "oauth";
    baseUrl: string;
    configured: boolean;
    credentialReference: string | null;
    lastError: string | null;
  };
  documentRefs: OnshapeDocumentRefRecord[];
  importRuns: CadImportRunRecord[];
  snapshots: CadSnapshotRecord[];
  latestSnapshot: CadSnapshotRecord | null;
  assemblyNodes: CadAssemblyNodeRecord[];
  partDefinitions: CadPartDefinitionRecord[];
  partInstances: CadPartInstanceRecord[];
  warnings: CadImportWarningRecord[];
  budget: OnshapeApiBudgetRecord;
}

export interface CadGraphImportResult {
  importRunId: string;
  snapshotId?: string;
  status: "completed" | "partial" | "failed";
  callsUsed: number;
  assemblyNodeCount: number;
  partDefinitionCount: number;
  partInstanceCount: number;
  warningCount: number;
  stoppedReason?: string;
}
