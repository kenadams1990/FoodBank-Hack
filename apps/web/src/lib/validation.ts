// validation.ts — Zod schemas for all API request/response types
import { z } from 'zod';

export const LotStatusSchema = z.enum([
  'AVAILABLE', 'SCORED', 'PROCUREMENT_PENDING', 'PROCUREMENT_CONFIRMED',
  'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'EXPIRED'
]);

export const ApprovalTypeSchema = z.enum(['PROCUREMENT', 'FACILITY_BOOKING', 'DELIVERY_RELEASE']);
export const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const CreateApprovalSchema = z.object({
  approvalType: ApprovalTypeSchema,
  entityId: z.string().min(1),
  draftPayload: z.unknown(),
  operatorId: z.string().optional().default('operator'),
  notes: z.string().optional(),
});

export const PatchApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  operatorId: z.string().min(1),
  notes: z.string().optional(),
});

export const LotFilterSchema = z.object({
  species: z.string().optional(),
  status: LotStatusSchema.optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
});

export const AuditQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  perPage: z.coerce.number().min(1).max(100).optional().default(50),
});
