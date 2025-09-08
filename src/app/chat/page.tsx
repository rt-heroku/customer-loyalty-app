'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Download, 
  Trash2,
  Settings,
  History,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/chat/ChatMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import FileUploadModal from '@/components/chat/FileUploadModal';
import { ChatMessage as ChatMessageType, ChatSession } from '@/types/chat';

export default function ChatPage() {
  const { user } = useAuth();
  const { 
    chatState, 
    sendMessage, 
    clearChat, 
    loadChatSettings,
    isChatEnabled 
  } = useChat();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChatSettings();
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions?limit=20');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createNewSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      const data = await response.json();
      if (data.sessionId) {
        await loadSessions();
        // Load the new session
        await loadSessionMessages(data.sessionId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await response.json();
      
      if (data.session) {
        // Update the current session in context
        // This would need to be implemented in the ChatContext
        console.log('Loaded session:', data.session);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      await sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (files: File[]) => {
    sendMessage('', files);
    setShowFileUpload(false);
  };

  const exportChat = () => {
    if (!chatState.messages.length) return;
    
    const chatData = {
      session: chatState.currentSession,
      messages: chatState.messages,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isChatEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Unavailable</h2>
          <p className="text-gray-600">Chat functionality is currently disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-gray-600 mt-1">Get help with your loyalty program and account</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSessions(!showSessions)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Chat History"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={exportChat}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Export Chat"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Sessions Sidebar */}
          <AnimatePresence>
            {showSessions && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Chat History</h3>
                    <button
                      onClick={createNewSession}
                      disabled={isLoading}
                      className="p-1 text-primary-500 hover:text-primary-600 transition-colors"
                      title="New Chat"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSessionMessages(session.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {session.title || 'Untitled Chat'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className={`${showSessions ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {chatState.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ChatMessage message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {chatState.typingIndicator && (
                  <TypingIndicator indicator={chatState.typingIndicator} />
                )}
                
                {chatState.messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                    <p className="text-gray-600">Ask me anything about your loyalty program, account, or get help with any questions you have.</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '56px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={() => setShowFileUpload(true)}
                      className="absolute right-3 bottom-3 p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || chatState.isSending}
                    className="p-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUploadModal
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onUpload={handleFileUpload}
        />
      )}
    </div>
  );
}
