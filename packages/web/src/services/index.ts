// Gemini AI service (for direct AI calls from frontend)
export {
  analyzeContent,
  verifyWithSearch,
  askFollowUp,
  speakText,
} from './geminiService';

// Backend API service
export {
  analyzeMessage,
  getAnalysisStatus,
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory,
  sendChatMessage,
  getChatConversation,
  verifyScam,
  checkHealth,
} from './apiService';
