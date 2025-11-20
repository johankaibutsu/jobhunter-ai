
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, RefreshCcw, Mic } from 'lucide-react';
import { createInterviewSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';

interface Props {
  targetRole: string;
  onSessionStart?: () => void;
}

export const InterviewCoach: React.FC<Props> = ({ targetRole, onSessionStart }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startNewSession = () => {
    setMessages([{
      role: 'model',
      text: `Hello! I'm ready to conduct a mock interview for the ${targetRole} position. Are you ready to begin?`,
      timestamp: Date.now()
    }]);
    const newSession = createInterviewSession(targetRole);
    setSession(newSession);
    setIsLoading(false);
    if (onSessionStart) onSessionStart();
  };

  useEffect(() => {
    startNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await session.sendMessage({ message: input });
      const text = result.text;
      
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text, timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Interview Coach</h2>
          <p className="text-slate-500">Practicing for: <span className="font-semibold text-indigo-600">{targetRole}</span></p>
        </div>
        <button 
          onClick={startNewSession}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 px-4 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Restart Session
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] mt-2 block opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                   <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your answer..."
                className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-[50px]"
                rows={1}
              />
              <Mic className="absolute right-3 bottom-3.5 w-5 h-5 text-slate-400 cursor-not-allowed opacity-50" />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-indigo-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">AI can make mistakes. Please double check important information.</p>
        </div>
      </div>
    </div>
  );
};
