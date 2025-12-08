/**
 * ScamShield Shared Constants
 * Constants used across frontend and backend
 */

// ============================================================================
// Application Constants
// ============================================================================

export const APP_NAME = 'ScamShield';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered assistant to help identify and prevent fraud';

// ============================================================================
// API Configuration
// ============================================================================

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const API_ENDPOINTS = {
  // Analysis
  ANALYZE: `${API_BASE_PATH}/analyze`,
  ANALYZE_STATUS: (id: string) => `${API_BASE_PATH}/analyze/${id}/status`,

  // History
  HISTORY: `${API_BASE_PATH}/history`,
  HISTORY_ITEM: (id: string) => `${API_BASE_PATH}/history/${id}`,

  // Chat
  CHAT: `${API_BASE_PATH}/chat`,
  CHAT_CONVERSATION: (id: string) => `${API_BASE_PATH}/chat/${id}`,

  // Search
  SEARCH_VERIFY: `${API_BASE_PATH}/search/verify`,

  // User
  USER: `${API_BASE_PATH}/user`,
  USER_PREFERENCES: `${API_BASE_PATH}/user/preferences`,

  // Health
  HEALTH: `${API_BASE_PATH}/health`,
} as const;

// ============================================================================
// Scam Type Metadata
// ============================================================================

export interface ScamTypeInfo {
  id: string;
  name: string;
  description: string;
  redFlags: string[];
  icon: string;
  color: string;
}

export const SCAM_TYPES: Record<string, ScamTypeInfo> = {
  grandparent_scam: {
    id: 'grandparent_scam',
    name: 'Grandparent Scam',
    description: 'Scammers pretend to be a grandchild in trouble, asking for money urgently.',
    redFlags: [
      'Caller claims to be a grandchild or family member',
      'Urgent request for money',
      'Asks you to keep it secret from other family',
      'Unusual payment methods requested',
    ],
    icon: 'Users',
    color: 'purple',
  },
  fake_tech_support: {
    id: 'fake_tech_support',
    name: 'Tech Support Scam',
    description: 'Fake technicians claim your computer has problems and ask for access or payment.',
    redFlags: [
      'Unsolicited calls about computer problems',
      'Requests remote access to your computer',
      'Asks for payment via gift cards',
      'Claims to be from Microsoft, Apple, or Google',
    ],
    icon: 'Monitor',
    color: 'blue',
  },
  fake_government_or_tax: {
    id: 'fake_government_or_tax',
    name: 'Government/Tax Scam',
    description: 'Impersonators claim to be from IRS, Social Security, or Medicare demanding payment.',
    redFlags: [
      'Threatens arrest or legal action',
      'Demands immediate payment',
      'Asks for SSN or personal information',
      'Government agencies rarely call unexpectedly',
    ],
    icon: 'Building',
    color: 'red',
  },
  lottery_or_prize_scam: {
    id: 'lottery_or_prize_scam',
    name: 'Lottery/Prize Scam',
    description: 'Claims you won a prize but must pay fees to collect your "winnings".',
    redFlags: [
      'You "won" a contest you never entered',
      'Must pay fees to receive the prize',
      'Requests bank account information',
      'Creates urgency to claim prize',
    ],
    icon: 'Gift',
    color: 'green',
  },
  bank_account_scam: {
    id: 'bank_account_scam',
    name: 'Bank Account Scam',
    description: 'Fraudsters pretend to be from your bank to steal login credentials or money.',
    redFlags: [
      'Urgent claims about account problems',
      'Requests for login credentials',
      'Links to fake banking websites',
      'Asks to verify personal information',
    ],
    icon: 'CreditCard',
    color: 'yellow',
  },
  delivery_or_package_scam: {
    id: 'delivery_or_package_scam',
    name: 'Delivery/Package Scam',
    description: 'Fake delivery notifications asking for personal info or payment.',
    redFlags: [
      'Unexpected package delivery notice',
      'Requests personal information',
      'Asks for delivery fees via unusual methods',
      'Links to unofficial websites',
    ],
    icon: 'Package',
    color: 'orange',
  },
  romance_scam: {
    id: 'romance_scam',
    name: 'Romance Scam',
    description: 'Scammers build fake relationships online to eventually ask for money.',
    redFlags: [
      'Relationship moves very quickly',
      'Always has excuses to not meet in person',
      'Eventually asks for money',
      'Stories seem too perfect',
    ],
    icon: 'Heart',
    color: 'pink',
  },
  charity_scam: {
    id: 'charity_scam',
    name: 'Charity Scam',
    description: 'Fake charities or impersonators exploit generosity to steal donations.',
    redFlags: [
      'High-pressure donation tactics',
      'Vague about how funds are used',
      'Only accepts cash or gift cards',
      'Unable to provide documentation',
    ],
    icon: 'HandHeart',
    color: 'teal',
  },
  investment_or_crypto_scam: {
    id: 'investment_or_crypto_scam',
    name: 'Investment/Crypto Scam',
    description: 'Fraudulent investment opportunities promising guaranteed high returns.',
    redFlags: [
      'Promises of guaranteed high returns',
      'Pressure to invest quickly',
      'Unsolicited investment advice',
      'Complex strategies you can\'t understand',
    ],
    icon: 'TrendingUp',
    color: 'indigo',
  },
  phishing_or_credential_harvest: {
    id: 'phishing_or_credential_harvest',
    name: 'Phishing Scam',
    description: 'Attempts to steal passwords and personal information through fake websites or emails.',
    redFlags: [
      'Requests to verify account information',
      'Suspicious email sender addresses',
      'Links to fake websites',
      'Grammar and spelling errors',
    ],
    icon: 'AlertTriangle',
    color: 'slate',
  },
  other_or_unknown: {
    id: 'other_or_unknown',
    name: 'Other/Unknown',
    description: 'Suspicious activity that doesn\'t fit other categories.',
    redFlags: [
      'Unusual requests for personal info',
      'Pressure tactics',
      'Requests for untraceable payments',
      'Something just feels wrong',
    ],
    icon: 'HelpCircle',
    color: 'gray',
  },
} as const;

// ============================================================================
// Risk Level Configuration
// ============================================================================

export const RISK_LEVELS = {
  HIGH: {
    label: 'High Risk',
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-500',
    icon: 'ShieldAlert',
    threshold: 0.7,
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-500',
    icon: 'ShieldQuestion',
    threshold: 0.4,
  },
  LOW: {
    label: 'Low Risk',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-500',
    icon: 'ShieldCheck',
    threshold: 0,
  },
} as const;

// ============================================================================
// Regulatory Agencies
// ============================================================================

export const REGULATORY_AGENCIES = {
  FTC: {
    name: 'Federal Trade Commission (FTC)',
    website: 'https://reportfraud.ftc.gov',
    phone: '1-877-382-4357',
    description: 'Report scams and fraud to the FTC',
  },
  FBI_IC3: {
    name: 'FBI Internet Crime Complaint Center',
    website: 'https://www.ic3.gov',
    description: 'Report internet-related fraud and crime',
  },
  FCC: {
    name: 'Federal Communications Commission',
    website: 'https://consumercomplaints.fcc.gov',
    phone: '1-888-225-5322',
    description: 'Report phone scams and robocalls',
  },
  SSA: {
    name: 'Social Security Administration',
    website: 'https://oig.ssa.gov',
    phone: '1-800-269-0271',
    description: 'Report Social Security fraud',
  },
  IRS: {
    name: 'Internal Revenue Service',
    website: 'https://www.irs.gov/privacy-disclosure/report-phishing',
    description: 'Report tax-related scams',
  },
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const FONT_SIZES = {
  small: {
    base: 'text-sm',
    heading: 'text-lg',
    label: 'text-xs',
  },
  medium: {
    base: 'text-base',
    heading: 'text-xl',
    label: 'text-sm',
  },
  large: {
    base: 'text-lg',
    heading: 'text-2xl',
    label: 'text-base',
  },
} as const;

export const THEMES = {
  light: {
    canvas: '#F5F7FA',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1A1A2E',
    primary: '#3B82F6',
  },
  dark: {
    canvas: '#0F0F1A',
    surface: '#1A1A2E',
    border: '#2D2D3A',
    text: '#FFFFFF',
    primary: '#3B82F6',
  },
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MAX_TEXT_LENGTH: 50000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  MIN_AUDIO_DURATION: 1, // seconds
  MAX_AUDIO_DURATION: 600, // 10 minutes
} as const;

// ============================================================================
// AI Model Configuration
// ============================================================================

export const AI_MODELS = {
  ANALYSIS: 'gemini-2.5-pro-preview-05-06',
  CHAT: 'gemini-2.5-flash',
  TTS: 'gemini-2.5-flash-preview-tts',
  TRANSCRIPTION: 'gemini-2.0-flash-live-001',
} as const;

export const AI_CONFIG = {
  ANALYSIS_THINKING_BUDGET: 32768,
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.7,
  TTS_VOICE: 'Kore',
} as const;
