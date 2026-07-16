// validation.ts — Zod schemas for all API request/response types
import { z } from 'zod';

export const LotStatusSchema = z.enum([
  'AVAILABLE', 'SCORING', 'PENDING_PROCUREMENT', 'PROCUREMENT_CONFIRMED',
  'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'EXPIRED'
]);

export const ApprovalTypeSchema = z.enum(['PROCUREMENT', 'FACILITY_BOOKING', 'DELIVERY_RELEASE']);
export const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const CreateApprovalSchema = z.object({
  approvalType: ApprovalTypeSchema,
  entityId: z.string().min(1),
  entityType: z.string().min(1),
  rationale: z.string().min(1),
});

export const PatchApprovalSchema = z.object({
  action: z.enum(['approve', 'reject']),
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
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

export type Role = 'OPERATOR' | 'VIEWER';

// Simple role resolution from request headers (X-Role: OPERATOR|VIEWER)
export function resolveRole(request: Request): Role {
  const role = request.headers.get('x-role');
  if (role === 'OPERATOR') return 'OPERATOR';
  return 'VIEWER';
}

export function requireOperator(request: Request): void {
  if (resolveRole(request) !== 'OPERATOR') {
    throw new Response(JSON.stringify({ error: 'Forbidden: OPERATOR role required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
