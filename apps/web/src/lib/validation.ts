// validation.ts — Zod schemas for all API request/response types
import { z } from 'zod';

export const ApprovalTypeSchema = z.enum(['PROCUREMENT', 'FACILITY_BOOKING', 'DELIVERY_RELEASE']);
export const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const LotStatusSchema = z.enum([
  'AVAILABLE', 'SCORED', 'PENDING_PROCUREMENT', 'PROCUREMENT_CONFIRMED',
  'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'EXPIRED'
]);

export const CreateApprovalSchema = z.object({
  approvalType: ApprovalTypeSchema,
  entityId: z.string().min(1),
  entityType: z.string().min(1),
  draftPayload: z.record(z.unknown()),
});

export const PatchApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  operatorId: z.string().min(1),
  notes: z.string().optional(),
});

export const LotFilterSchema = z.object({
  species: z.string().optional(),
  status: LotStatusSchema.optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
});

export const AuditFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  entityType: z.string().optional(),
});
