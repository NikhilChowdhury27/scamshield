/**
 * ScamShield Shared Types
 * Shared type definitions used across frontend and backend
 */

// ============================================================================
// Risk Assessment Types
// ============================================================================

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ScamType =
  | 'grandparent_scam'
  | 'fake_tech_support'
  | 'fake_government_or_tax'
  | 'lottery_or_prize_scam'
  | 'bank_account_scam'
  | 'delivery_or_package_scam'
  | 'romance_scam'
  | 'charity_scam'
  | 'investment_or_crypto_scam'
  | 'phishing_or_credential_harvest'
  | 'other_or_unknown';

// ============================================================================
// Analysis Types
// ============================================================================

export interface RedFlag {
  text: string;
  severity: RiskLevel;
  category?: string;
}

export interface RegulatoryReportingSuggestion {
  agency: string;
  website?: string;
  phone?: string;
  description: string;
}

export interface InputInterpretation {
  type: 'text' | 'image' | 'audio' | 'multimodal';
  language?: string;
  confidence: number;
}

export interface ScamAnalysis {
  id: string;
  risk_score: number;
  risk_label: RiskLevel;
  scam_type: ScamType;
  summary_for_elder: string;
  red_flags: RedFlag[];
  safe_actions_for_elder: string[];
  call_script_if_scammer_calls_back: string;
  family_alert_text: string;
  regulatory_reporting_suggestions: RegulatoryReportingSuggestion[];
  input_interpretation: InputInterpretation;
  disclaimer_for_elder: string;
  transcription?: string;
  analysis_notes_for_developers?: string;
  created_at: Date;
}

// ============================================================================
// Input Types
// ============================================================================

export type FileType = 'image' | 'audio' | 'document';

export interface FileInput {
  id: string;
  file: File;
  previewUrl: string;
  type: FileType;
  name: string;
  size: number;
}

export interface AnalysisInput {
  text?: string;
  files?: FileInput[];
}

// ============================================================================
// Chat Types
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  context?: ScamAnalysis;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// History Types
// ============================================================================

export interface HistoryItem {
  id: string;
  timestamp: Date;
  analysis: ScamAnalysis;
  searchResult?: SearchVerification;
  input: {
    text?: string;
    fileTypes?: FileType[];
  };
}

export interface SearchVerification {
  query: string;
  result: string;
  sources: SearchSource[];
  verified_at: Date;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email?: string;
  display_name?: string;
  preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  timestamp: Date;
  request_id?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketEventType =
  | 'analysis:started'
  | 'analysis:progress'
  | 'analysis:completed'
  | 'analysis:error'
  | 'transcription:chunk'
  | 'transcription:completed'
  | 'chat:message';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: Date;
}

// ============================================================================
// Audio Types
// ============================================================================

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
}

export interface TranscriptionChunk {
  text: string;
  timestamp: number;
  is_final: boolean;
  confidence?: number;
}

// ============================================================================
// Extension Types (Chrome Extension)
// ============================================================================

export interface ExtensionMessage {
  type: 'ANALYZE_EMAIL' | 'GET_ANALYSIS' | 'SETTINGS_UPDATE';
  payload: unknown;
}

export interface EmailAnalysisRequest {
  subject: string;
  sender: string;
  body: string;
  attachments?: string[];
}
