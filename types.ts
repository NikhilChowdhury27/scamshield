export type RiskLabel = 'HIGH' | 'MEDIUM' | 'LOW';

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

export interface RedFlag {
  title: string;
  description_for_elder: string;
}

export interface RegulatoryReportingSuggestion {
  region_hint: string;
  description: string;
  example_contacts: string[];
}

export interface InputInterpretation {
  content_type: 'text' | 'image' | 'audio' | 'mixed';
  language_detected: string;
  sender_claimed_identity: string;
  requested_actions: string[];
  requested_payment_methods: string[];
}

export interface ScamAnalysis {
  risk_score: number;
  risk_label: RiskLabel;
  scam_type: ScamType;
  summary_for_elder: string;
  red_flags: RedFlag[];
  safe_actions_for_elder: string[];
  call_script_if_scammer_calls_back: string;
  family_alert_text: string;
  regulatory_reporting_suggestions: RegulatoryReportingSuggestion[];
  input_interpretation: InputInterpretation;
  disclaimer_for_elder: string;
  transcription?: string; // Added for audio analysis
  analysis_notes_for_developers?: string;
}

export interface AnalysisResponse {
  analysis: ScamAnalysis;
}

export interface FileInput {
  file: File;
  previewUrl: string;
  type: 'image' | 'audio';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  analysis: ScamAnalysis;
  searchResult?: string; // Add search result to history
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SearchVerificationResult {
    text: string;
    sources: { uri: string; title: string }[];
}