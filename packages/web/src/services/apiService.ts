/**
 * API Service
 * Handles communication with the backend API
 */

import type { ApiResponse, ScamAnalysis, HistoryItem, ChatMessage, PaginationParams } from '@scamshield/shared';
import { API_ENDPOINTS } from '@scamshield/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base fetch wrapper with error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'REQUEST_FAILED',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}

// ============================================================================
// Analysis API
// ============================================================================

export async function analyzeMessage(text: string, files?: File[]): Promise<ApiResponse<ScamAnalysis>> {
  const formData = new FormData();
  formData.append('text', text);

  if (files) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ANALYZE}`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function getAnalysisStatus(id: string): Promise<ApiResponse<{ status: string; result?: ScamAnalysis }>> {
  return request(API_ENDPOINTS.ANALYZE_STATUS(id));
}

// ============================================================================
// History API
// ============================================================================

export async function getHistory(params?: PaginationParams): Promise<ApiResponse<HistoryItem[]>> {
  return request(API_ENDPOINTS.HISTORY, { params: params as Record<string, string | number | boolean | undefined> });
}

export async function getHistoryItem(id: string): Promise<ApiResponse<HistoryItem>> {
  return request(API_ENDPOINTS.HISTORY_ITEM(id));
}

export async function deleteHistoryItem(id: string): Promise<ApiResponse<void>> {
  return request(API_ENDPOINTS.HISTORY_ITEM(id), { method: 'DELETE' });
}

export async function clearHistory(): Promise<ApiResponse<void>> {
  return request(API_ENDPOINTS.HISTORY, { method: 'DELETE' });
}

// ============================================================================
// Chat API
// ============================================================================

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  context?: ScamAnalysis
): Promise<ApiResponse<ChatMessage>> {
  return request(API_ENDPOINTS.CHAT, {
    method: 'POST',
    body: JSON.stringify({
      content: message,
      conversation_id: conversationId,
      context,
    }),
  });
}

export async function getChatConversation(id: string): Promise<ApiResponse<ChatMessage[]>> {
  return request(API_ENDPOINTS.CHAT_CONVERSATION(id));
}

// ============================================================================
// Search API
// ============================================================================

export async function verifyScam(query: string, context?: string): Promise<ApiResponse<{ result: string; sources: { title: string; url: string }[] }>> {
  return request(API_ENDPOINTS.SEARCH_VERIFY, {
    method: 'POST',
    body: JSON.stringify({ query, context }),
  });
}

// ============================================================================
// Health API
// ============================================================================

export async function checkHealth(): Promise<ApiResponse<{ status: string; timestamp: Date }>> {
  return request(API_ENDPOINTS.HEALTH);
}
