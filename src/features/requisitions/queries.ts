import "server-only";
import { prisma } from "@/lib/prisma";
import type { RequisitionStatus } from "@/generated/prisma/enums";

export type RequisitionItemSummary = {
  productName: string;
  quantity: number;
  unit: string;
};

// Dates cross the RSC boundary as ISO strings; client cells format them.
export type RequisitionRow = {
  id: string;
  reqNumber: string;
  status: RequisitionStatus;
  note: string | null;
  requesterId: string;
  requesterName: string;
  decidedByName: string | null;
  createdAt: string;
  items: RequisitionItemSummary[];
};

export async function getRequisitions(
  orgId: string,
  requesterId?: string,
): Promise<RequisitionRow[]> {
  const requisitions = await prisma.requisition.findMany({
    where: { organizationId: orgId, ...(requesterId ? { requesterId } : {}) },
    include: {
      requester: { select: { name: true } },
      decidedBy: { select: { name: true } },
      items: {
        include: { product: { select: { name: true, unit: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return requisitions.map((r) => ({
    id: r.id,
    reqNumber: r.reqNumber,
    status: r.status,
    note: r.note,
    requesterId: r.requesterId,
    requesterName: r.requester.name,
    decidedByName: r.decidedBy?.name ?? null,
    createdAt: r.createdAt.toISOString(),
    items: r.items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      unit: item.product.unit,
    })),
  }));
}
