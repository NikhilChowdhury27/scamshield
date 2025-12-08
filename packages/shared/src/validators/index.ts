/**
 * ScamShield Shared Validators
 * Zod schemas for validation across frontend and backend
 */

import { z } from 'zod';
import { VALIDATION } from '../constants';

// ============================================================================
// Base Schemas
// ============================================================================

export const RiskLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const ScamTypeSchema = z.enum([
  'grandparent_scam',
  'fake_tech_support',
  'fake_government_or_tax',
  'lottery_or_prize_scam',
  'bank_account_scam',
  'delivery_or_package_scam',
  'romance_scam',
  'charity_scam',
  'investment_or_crypto_scam',
  'phishing_or_credential_harvest',
  'other_or_unknown',
]);

export const FileTypeSchema = z.enum(['image', 'audio', 'document']);

export const ChatRoleSchema = z.enum(['user', 'assistant', 'system']);

export const ThemeSchema = z.enum(['light', 'dark', 'system']);

export const FontSizeSchema = z.enum(['small', 'medium', 'large']);

// ============================================================================
// Analysis Schemas
// ============================================================================

export const RedFlagSchema = z.object({
  text: z.string().min(1),
  severity: RiskLevelSchema,
  category: z.string().optional(),
});

export const RegulatoryReportingSuggestionSchema = z.object({
  agency: z.string().min(1),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  description: z.string().min(1),
});

export const InputInterpretationSchema = z.object({
  type: z.enum(['text', 'image', 'audio', 'multimodal']),
  language: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const ScamAnalysisSchema = z.object({
  id: z.string(),
  risk_score: z.number().min(0).max(1),
  risk_label: RiskLevelSchema,
  scam_type: ScamTypeSchema,
  summary_for_elder: z.string(),
  red_flags: z.array(RedFlagSchema),
  safe_actions_for_elder: z.array(z.string()),
  call_script_if_scammer_calls_back: z.string(),
  family_alert_text: z.string(),
  regulatory_reporting_suggestions: z.array(RegulatoryReportingSuggestionSchema),
  input_interpretation: InputInterpretationSchema,
  disclaimer_for_elder: z.string(),
  transcription: z.string().optional(),
  analysis_notes_for_developers: z.string().optional(),
  created_at: z.coerce.date(),
});

// ============================================================================
// Input Schemas
// ============================================================================

export const AnalysisInputSchema = z.object({
  text: z
    .string()
    .max(VALIDATION.MAX_TEXT_LENGTH, `Text must be less than ${VALIDATION.MAX_TEXT_LENGTH} characters`)
    .optional(),
  files: z.array(z.any()).max(VALIDATION.MAX_FILES).optional(),
}).refine(
  (data) => data.text || (data.files && data.files.length > 0),
  { message: 'Either text or files must be provided' }
);

export const FileUploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(VALIDATION.MAX_FILE_SIZE, 'File size exceeds limit'),
  type: z.string(),
});

// ============================================================================
// Chat Schemas
// ============================================================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleSchema,
  content: z.string().min(1).max(10000),
  timestamp: z.coerce.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const ChatConversationSchema = z.object({
  id: z.string(),
  messages: z.array(ChatMessageSchema),
  context: ScamAnalysisSchema.optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1).max(10000),
  conversation_id: z.string().optional(),
  context: ScamAnalysisSchema.optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
});

export const AccessibilityPreferencesSchema = z.object({
  reduceMotion: z.boolean(),
  highContrast: z.boolean(),
  screenReader: z.boolean(),
});

export const UserPreferencesSchema = z.object({
  theme: ThemeSchema,
  fontSize: FontSizeSchema,
  language: z.string().min(2).max(10),
  notifications: NotificationPreferencesSchema,
  accessibility: AccessibilityPreferencesSchema,
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  display_name: z.string().min(1).max(100).optional(),
  preferences: UserPreferencesSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const UpdateUserPreferencesSchema = UserPreferencesSchema.partial();

// ============================================================================
// API Request Schemas
// ============================================================================

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const HistoryFilterSchema = z.object({
  risk_level: RiskLevelSchema.optional(),
  scam_type: ScamTypeSchema.optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
}).merge(PaginationParamsSchema);

export const SearchVerifyRequestSchema = z.object({
  query: z.string().min(1).max(500),
  context: z.string().max(2000).optional(),
});

// ============================================================================
// Email Analysis Schema (Chrome Extension)
// ============================================================================

export const EmailAnalysisRequestSchema = z.object({
  subject: z.string().max(500),
  sender: z.string().max(500),
  body: z.string().max(VALIDATION.MAX_TEXT_LENGTH),
  attachments: z.array(z.string()).optional(),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateAnalysisInput(data: unknown) {
  return AnalysisInputSchema.safeParse(data);
}

export function validateScamAnalysis(data: unknown) {
  return ScamAnalysisSchema.safeParse(data);
}

export function validateUserPreferences(data: unknown) {
  return UserPreferencesSchema.safeParse(data);
}

export function validatePaginationParams(data: unknown) {
  return PaginationParamsSchema.safeParse(data);
}

export function validateFileUpload(file: { name: string; size: number; type: string }) {
  const baseValidation = FileUploadSchema.safeParse(file);
  if (!baseValidation.success) return baseValidation;

  // Check file type
  const isImage = VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type);
  const isAudio = VALIDATION.ALLOWED_AUDIO_TYPES.includes(file.type);
  const isDocument = VALIDATION.ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (!isImage && !isAudio && !isDocument) {
    return {
      success: false as const,
      error: new z.ZodError([
        {
          code: 'custom',
          message: 'File type not supported',
          path: ['type'],
        },
      ]),
    };
  }

  return { success: true as const, data: file };
}

// ============================================================================
// Type Exports from Schemas
// ============================================================================

export type ValidatedAnalysisInput = z.infer<typeof AnalysisInputSchema>;
export type ValidatedScamAnalysis = z.infer<typeof ScamAnalysisSchema>;
export type ValidatedUserPreferences = z.infer<typeof UserPreferencesSchema>;
export type ValidatedPaginationParams = z.infer<typeof PaginationParamsSchema>;
export type ValidatedHistoryFilter = z.infer<typeof HistoryFilterSchema>;
export type ValidatedChatMessage = z.infer<typeof ChatMessageSchema>;
export type ValidatedSendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
