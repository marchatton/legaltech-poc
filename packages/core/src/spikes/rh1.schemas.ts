import { z } from "zod";

export const LocalPdfQuerySchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid pack id"),
  filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_.-]+\.pdf$/i, "Invalid filename"),
});

export type LocalPdfQuery = z.infer<typeof LocalPdfQuerySchema>;

export const PdfPerfJumpRowSchema = z.object({
  requestedPage: z.number().int().positive(),
  cancelledPrevious: z.boolean(),
  t_request: z.number(),
  t_gotPage: z.number().nullable(),
  t_renderStart: z.number().nullable(),
  t_renderEnd: z.number().nullable(),
  getPageMs: z.number().nullable(),
  renderMs: z.number().nullable(),
  totalMs: z.number().nullable(),
  error: z.string().optional(),
});

export type PdfPerfJumpRow = z.infer<typeof PdfPerfJumpRowSchema>;

export const PdfPerfLongTaskStatsSchema = z.object({
  longTaskCount: z.number().int().nonnegative(),
  maxLongTaskMs: z.number().nonnegative(),
  totalLongTaskMs: z.number().nonnegative(),
});

export type PdfPerfLongTaskStats = z.infer<typeof PdfPerfLongTaskStatsSchema>;

export const PdfPerfRunSchema = z.object({
  createdAt: z.string(),
  pdfjsVersion: z.string().optional(),
  userAgent: z.string().optional(),
  devicePixelRatio: z.number().optional(),

  doc: z.object({
    pack: z.string(),
    filename: z.string(),
    document_id: z.string(),
  }),

  zoomPercent: z.number(),
  pageRotate: z.number().optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  canvas: z
    .object({
      width: z.number(),
      height: z.number(),
      cssWidth: z.number(),
      cssHeight: z.number(),
    })
    .optional(),

  test: z.object({
    type: z.enum(["serial", "spam"]),
    n: z.number().int().positive(),
    intervalMs: z.number().int().nonnegative().optional(),
    pageSequence: z.array(z.number().int().positive()),
  }),

  rows: z.array(PdfPerfJumpRowSchema),
  longTasks: PdfPerfLongTaskStatsSchema,
});

export type PdfPerfRun = z.infer<typeof PdfPerfRunSchema>;
