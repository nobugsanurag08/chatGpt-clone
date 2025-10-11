'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Paperclip, 
  ArrowUp,
  LogIn,
  UserPlus,
  Plus,
  Copy,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Count AI responses only (not user messages)
    const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
    
    // Limit to 4 AI responses for unauthenticated users
    if (aiResponseCount >= 4) {
      toast.error('Please sign in to continue chatting. You can only get 4 AI responses as a guest.');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      handleSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      toast.info('File upload functionality will be implemented');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const handleEdit = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditContent(content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;

    // Find the index of the edited message
    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    // Update the message content
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content: editContent.trim() } : msg
    ));
    setEditingMessageId(null);
    setEditContent('');
    toast.success('Message updated');

    // Remove all messages after the edited message (including AI responses)
    const updatedMessages = messages.slice(0, messageIndex + 1).map(msg => 
      msg.id === id ? { ...msg, content: editContent.trim() } : msg
    );
    
    // Set the updated messages (removing AI responses after the edited message)
    setMessages(updatedMessages);
    
    // Trigger new AI response with the edited message
    setAiLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting new response:', error);
      toast.error('Failed to get new response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  return (
    <div className="h-screen bg-[#212121] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* OpenAI Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-sm"></div>
          </div>
        </div>

        {/* Header Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black hover:bg-gray-100 border-gray-300 rounded-md px-4 py-2"
            onClick={() => window.location.href = '/sign-in'}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black hover:bg-gray-100 border-gray-300 rounded-md px-4 py-2"
            onClick={() => window.location.href = '/sign-up'}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <h1 className="text-6xl font-bold text-white mb-8 text-center">
              ChatGPT
            </h1>
            <div className="text-center text-gray-300 max-w-2xl px-8">
              <p className="text-lg mb-4">How can I help you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setMessage("Help me write a professional email")}>
                  <h3 className="font-semibold text-white mb-2">✉️ Write an email</h3>
                  <p className="text-sm text-gray-400">Professional, casual, or formal</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setMessage("Explain a complex topic in simple terms")}>
                  <h3 className="font-semibold text-white mb-2">💡 Explain concepts</h3>
                  <p className="text-sm text-gray-400">Break down complex ideas</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setMessage("Help me debug this code")}>
                  <h3 className="font-semibold text-white mb-2">🐛 Debug code</h3>
                  <p className="text-sm text-gray-400">Find and fix programming issues</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setMessage("Help me brainstorm creative ideas")}>
                  <h3 className="font-semibold text-white mb-2">🎨 Brainstorm</h3>
                  <p className="text-sm text-gray-400">Generate creative solutions</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto px-4 pb-32 chat-container">
            <div className="max-w-4xl mx-auto px-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`group relative py-6 ${msg.role === 'user' ? 'chatgpt-user-message' : 'chatgpt-ai-message'}`}
                >
                  <div className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 items-start max-w-4xl w-fit ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          msg.role === 'user'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-white'
                        }`}>
                          {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 max-w-3xl">
                        {editingMessageId === msg.id ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] resize-none text-white bg-gray-800 border-gray-600 placeholder-gray-400"
                              placeholder="Edit your message..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(msg.id)}
                                disabled={!editContent.trim()}
                                className="cursor-pointer"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="cursor-pointer"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="w-full">
                            <div className={`${msg.role === 'user' ? 'user-message-bubble' : 'ai-message-bubble'}`}>
                              <p className="whitespace-pre-wrap leading-relaxed break-words text-white">{msg.content}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className={`flex items-center gap-1 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                              {msg.role === 'user' ? (
                                /* User message actions */
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(msg.id, msg.content)}
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                                    title="Edit message"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(msg.content)}
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                                    title="Copy message"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                /* AI message actions - only copy */
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopy(msg.content)}
                                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                                  title="Copy message"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {aiLoading && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="text-gray-400">AI is thinking...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-gray-700 z-10">
          <div className="max-w-4xl mx-auto p-4 px-8">
            {/* Message limit indicator */}
            {messages.length > 0 && (
              <div className="mb-2 text-center">
                {(() => {
                  const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
                  return aiResponseCount < 4 ? (
                    <p className="text-sm text-gray-400">
                      AI responses: {aiResponseCount}/4
                    </p>
                  ) : (
                    <p className="text-sm text-red-400">
                      AI response limit reached. Please sign in to continue.
                    </p>
                  );
                })()}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={(() => {
                    const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
                    return aiResponseCount >= 4 ? "Please sign in to continue chatting" : "Ask anything";
                  })()}
                  disabled={(() => {
                    const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
                    return aiResponseCount >= 4;
                  })()}
                  className={`w-full min-h-[60px] max-h-[200px] resize-none bg-[#2f2f2f] border-gray-600 text-white placeholder-gray-400 rounded-xl px-6 py-4 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(() => {
                    const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
                    return aiResponseCount >= 4 ? 'opacity-50 cursor-not-allowed' : '';
                  })()}`}
                />
                
                {/* Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                    title="Attach file"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!message.trim() || aiLoading || (() => {
                      const aiResponseCount = messages.filter(msg => msg.role === 'assistant').length;
                      return aiResponseCount >= 4;
                    })()}
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-100 text-gray-800 rounded-full flex items-center justify-center"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-gray-400 text-sm">
          By messaging ChatGPT, you agree to our{' '}
          <span className="underline cursor-pointer hover:text-white">Terms</span>
          {' '}and have read our{' '}
          <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>
          . See{' '}
          <span className="underline cursor-pointer hover:text-white">Cookie Preferences</span>
          .
        </p>
      </div>
    </div>
  );
}
