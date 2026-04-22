import type {
    BootstrapPayload,
    ManufacturingItemPayload,
    ManufacturingItemRecord,
    PurchaseItemPayload,
    PurchaseItemRecord,
    TaskPayload,
    TaskRecord,
} from "../types";

export function toErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Something went wrong while checking your session.";
}

export function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export function formatCurrency(value: number | undefined) {
    if (typeof value !== "number") return "Pending";
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

export function dateDiffInDays(start: string, end: string) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function splitList(value: string) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function joinList(values: string[]) {
    return values.join(", ");
}

export function buildEmptyTaskPayload(bootstrap: BootstrapPayload): TaskPayload {
    const firstSubsystem = bootstrap.subsystems[0]?.id ?? "";
    const firstStudent = bootstrap.members.find((m) => m.role === "student")?.id ?? bootstrap.members[0]?.id ?? null;
    const firstMentor = bootstrap.members.find((m) => m.role === "mentor")?.id ?? bootstrap.members[0]?.id ?? null;
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

export function buildEmptyPurchasePayload(bootstrap: BootstrapPayload): PurchaseItemPayload {
    return {
        title: "",
        subsystemId: bootstrap.subsystems[0]?.id ?? "",
        requestedById: bootstrap.members[0]?.id ?? null,
        quantity: 1,
        vendor: "",
        linkLabel: "",
        estimatedCost: 0,
        finalCost: undefined,
        approvedByMentor: false,
        status: "requested",
    };
}

export function buildEmptyManufacturingPayload(bootstrap: BootstrapPayload, process: ManufacturingItemPayload["process"]): ManufacturingItemPayload {
    return {
        title: "",
        subsystemId: bootstrap.subsystems[0]?.id ?? "",
        requestedById: bootstrap.members[0]?.id ?? null,
        process,
        dueDate: new Date().toISOString().slice(0, 10),
        material: "",
        quantity: 1,
        status: "requested",
        mentorReviewed: false,
        batchLabel: "",
    };
}

export const taskToPayload = (task: TaskRecord): TaskPayload => ({ ...task });

export const purchaseToPayload = (item: PurchaseItemRecord): PurchaseItemPayload => ({
    ...item,
    finalCost: item.finalCost ?? undefined,
});

export const manufacturingToPayload = (item: ManufacturingItemRecord): ManufacturingItemPayload => ({
    ...item,
    batchLabel: item.batchLabel ?? "",
});
