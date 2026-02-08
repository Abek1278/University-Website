import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bot, Send, Sparkles, Loader, AlertCircle } from 'lucide-react';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchQuickInsights();
    
    const welcomeMessage = {
      role: 'assistant',
      content: `👋 Hello ${user?.name}! I'm EduSense AI, your academic assistant.\n\nI have access to all your:\n• Assignments and deadlines\n• Attendance records\n• Announcements\n• Subject information\n\nAsk me anything like:\n• "What should I do today?"\n• "Do I have any pending assignments?"\n• "How's my attendance?"\n• "Any important announcements?"`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const fetchQuickInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await axios.get('/api/ai/insights');
      if (res.data.success) {
        setInsights(res.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await axios.post('/api/ai/chat', {
        message: inputMessage,
        conversationHistory
      });

      if (res.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: res.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process your request. Please check if the Gemini API key is configured.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What should I do today?",
    "Do I have any pending assignments?",
    "How's my attendance?",
    "Any important announcements?",
    "What's my academic status?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-96px)] -m-6">
      {/* Header with glassmorphism */}
      <div className="flex-shrink-0 backdrop-blur-xl bg-white/80 dark:bg-dark-800/80 border-b border-gray-200/50 dark:border-dark-700/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                EduSense AI
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your intelligent academic companion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50/50 via-purple-50/20 to-blue-50/20 dark:from-dark-900/50 dark:via-purple-900/5 dark:to-blue-900/5">
        <div className="h-full max-w-5xl mx-auto flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                        <Bot size={18} className="text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`rounded-2xl px-5 py-4 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white ml-auto'
                          : 'bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-dark-700/50'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    <div className={`text-xs mt-1.5 px-1 ${
                      message.role === 'user' ? 'text-right text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 ml-3 order-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                      <Bot size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm border border-gray-200/50 dark:border-dark-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Questions - Only show when there's just the welcome message */}
              {messages.length === 1 && !loading && (
                <div className="mt-8 animate-fade-in">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested prompts</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="px-4 py-3 text-sm text-left bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-dark-800 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 backdrop-blur-xl bg-white/80 dark:bg-dark-800/80 border-t border-gray-200/50 dark:border-dark-700/50">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Message EduSense AI..."
                    className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="absolute right-2 p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 text-center">
                Powered by Google Gemini AI • Responses based on your academic data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
