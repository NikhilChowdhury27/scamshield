import React, { useState } from 'react';
import { ChatMessage, ScamAnalysis } from '../types';
import { askFollowUpQuestion } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface FollowUpChatProps {
  analysis: ScamAnalysis;
}

const FollowUpChat: React.FC<FollowUpChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await askFollowUpQuestion(analysis, input);
      const botMsg: ChatMessage = { role: 'model', content: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'model', content: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 border-b border-blue-100 dark:border-blue-900/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ask a Follow-up Question</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">If you are still unsure, ask me anything else about this message.</p>
      </div>

      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50 max-h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8 italic">
            "Is it safe to reply?" <br/>
            "Should I call the number?"
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600'}`}>
              {msg.role === 'user' ? <User className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Bot className="w-6 h-6 text-white" />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-lg leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-tr-none' 
                : 'bg-blue-600 text-white rounded-tl-none shadow-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
               <Bot className="w-6 h-6 text-white" />
             </div>
             <div className="p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse w-32 h-12 rounded-tl-none"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow p-4 text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-300 dark:border-gray-600 rounded-full focus:border-blue-500 focus:ring-0 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FollowUpChat;