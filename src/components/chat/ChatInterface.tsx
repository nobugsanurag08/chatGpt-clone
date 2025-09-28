'use client';

import { useState, useEffect, useRef } from 'react';
// import { useChat } from '@ai-sdk/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Menu, Plus, Copy, X, ChevronDown, Share, Menu as Hamburger } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
    size: number;
  }[];
}

interface ChatInterfaceProps {
  initialConversations?: Conversation[];
  initialMessages?: Message[];
  currentConversationId?: string;
  onSendMessage?: (content: string, attachments?: any[]) => void;
  onFileUpload?: (files: FileList) => Promise<any[]>;
  isLoading?: boolean;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onClearAllChats?: () => void;
}

export default function ChatInterface({
  initialConversations = [],
  initialMessages = [],
  currentConversationId,
  onSendMessage,
  onFileUpload,
  isLoading = false,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAllChats
}: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Local state for messages
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync conversations when initialConversations changes
  useEffect(() => {
    // Always update conversations from props to ensure sync
    if (initialConversations.length >= 0) {
      setConversations(initialConversations);
    }
  }, [initialConversations]);

  // Sync messages when initialMessages changes
  useEffect(() => {
    // Always update messages from props to ensure sync
    if (initialMessages.length >= 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use smooth scrolling to bottom
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  // Also scroll when loading state changes
  useEffect(() => {
    if (aiLoading) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }
  }, [aiLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

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

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
      return;
    }
    // Fallback for when no onNewChat prop is provided
    setMessages([]);
    setIsMobileSidebarOpen(false);
    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConversation, ...prev]);
  };

  const handleSelectConversation = (id: string) => {
    if (onSelectConversation) {
      onSelectConversation(id);
      return;
    }
    
    // Fallback for when no onSelectConversation prop is provided
    // Load conversation messages
    // This would typically fetch from API
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (onDeleteConversation) {
      onDeleteConversation(id);
      return;
    }
    
    // Fallback for when no onDeleteConversation prop is provided
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    if (onRenameConversation) {
      onRenameConversation(id, newTitle);
      return;
    }
    
    // Fallback for when no onRenameConversation prop is provided
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title: newTitle, updatedAt: new Date().toISOString() } : conv
      )
    );
  };

  // Handle file uploads
  const handleFileUpload = async (files: FileList): Promise<any[]> => {
    if (onFileUpload) {
      return await onFileUpload(files);
    }
    return [];
  };

  const handleEditMessage = (id: string, _content: string) => {
    setEditingMessageId(id);
  };

  const handleSaveEdit = async (id: string, newContent: string) => {
    // Find the index of the edited message
    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    // Update the message content
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content: newContent } : msg
    ));
    setEditingMessageId(null);
    toast.success('Message updated');

    // Remove all messages after the edited message (including AI responses)
    const updatedMessages = messages.slice(0, messageIndex + 1).map(msg => 
      msg.id === id ? { ...msg, content: newContent } : msg
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

  const handleCancelEdit = (_id: string) => {
    setEditingMessageId(null);
  };

  const handleRegenerate = (_id: string) => {
    // Regenerate response
    toast.info('Regenerating response...');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/chat/${currentConversationId || 'new'}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex h-screen bg-[#212121] overflow-hidden w-full">
          <Sidebar
            conversations={conversations}
            onNewChat={onNewChat || handleNewChat}
            onSelectConversation={onSelectConversation || handleSelectConversation}
            onDeleteConversation={onDeleteConversation || handleDeleteConversation}
            currentConversationId={currentConversationId}
            onRenameConversation={onRenameConversation || handleRenameConversation}
            onClearAllChats={onClearAllChats}
            isMobileOpen={isMobileSidebarOpen}
            onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#212121] overflow-hidden chatgpt-main-area w-full">
        {/* Header - Visible on all screen sizes */}
        <div className="flex items-center justify-between p-4 bg-[#212121] chatgpt-header">
          <div className="flex items-center gap-2">
            {/* Mobile menu button - only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer bg-transparent rounded-md p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">ChatGPT</h1>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 text-white border-gray-600 hover:bg-gray-700 cursor-pointer bg-transparent rounded-md px-3 py-2"
              >
                <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sm:inline">Share</span>
              </Button>
            </div>
          )}
        </div>

        {/* Messages Area - Scrollable with bottom padding for fixed input */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 bg-[#212121] pb-32 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="text-center max-w-md mx-auto px-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  How can I help you today?
                </h1>
              </div>
            </div>
          ) : (
            <div className="space-y-0 px-4 sm:px-8">
              {messages.map((message: any) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={new Date()}
                  attachments={[]}
                  isEditing={editingMessageId === message.id}
                  onEdit={handleEditMessage}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onRegenerate={handleRegenerate}
                  onCopy={handleCopy}
                />
              ))}
              {aiLoading && (
                <div className="flex items-center gap-4 p-6">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    AI
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#212121] p-4 z-10 lg:left-auto lg:right-0" 
             style={{ 
               left: isSidebarCollapsed ? '80px' : '280px',
               right: '0'
             }}>
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <ChatInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isLoading={aiLoading}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-[#2f2f2f] border-gray-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Share public link to chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Your name, uploaded files, custom instructions, and any messages you add after sharing stay private.
            </p>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-[#404040] border-gray-600 text-white"
                placeholder="https://chatgpt.com/share/..."
              />
              <Button
                onClick={handleCopyUrl}
                className="bg-white text-black hover:bg-gray-200 cursor-pointer"
              >
                <Copy className="h-4 w-4 mr-2" />
                Create link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}