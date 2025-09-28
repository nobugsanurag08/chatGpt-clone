'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import { Toaster } from '@/components/ui/sonner';

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

export default function ChatPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const hasClearedRef = useRef(false);

  // Reset the flag when component mounts
  useEffect(() => {
    hasClearedRef.current = false;
  }, []);

  // Load conversations only once on mount
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    const loadInitialData = async () => {
      try {
        // Load conversations from localStorage
        const savedConversations = localStorage.getItem('chatgpt-conversations');
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
        }

        // Load current chat messages if chatId exists
        if (chatId && chatId !== 'new') {
          const savedMessages = localStorage.getItem(`chatgpt-messages-${chatId}`);
          if (savedMessages) {
            const parsedMessages = JSON.parse(savedMessages);
            setMessages(parsedMessages);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isLoaded, isSignedIn, user?.id]);

  // Separate useEffect for loading messages when chatId changes
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Set loading state while loading messages
    setIsLoading(true);
    
    if (chatId && chatId !== 'new') {
      const savedMessages = localStorage.getItem(`chatgpt-messages-${chatId}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
    
    // Clear loading state
    setIsLoading(false);
  }, [chatId, isLoaded, isSignedIn]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
      attachments
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Handle new chat case - create a new chatId if we're on 'new'
    let currentChatId = chatId;
    if (chatId === 'new') {
      // Create a new chat for this conversation
      const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newConversation = {
        id: newChatId,
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        updatedAt: new Date().toISOString(),
        messages: []
      };
      
      // Add to conversations list
      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      
      // Save conversations to localStorage
      localStorage.setItem('chatgpt-conversations', JSON.stringify(updatedConversations));
      
      // Update current chatId
      currentChatId = newChatId;
      
      // Navigate to the new chat
      router.push(`/chat/${newChatId}`);
    }
    
    // Save user message to localStorage with the correct chatId
    const messageKey = `chatgpt-messages-${currentChatId}`;
    localStorage.setItem(messageKey, JSON.stringify(updatedMessages));
    
    // Update chat title if this is the first message
    if (messages.length === 0 && currentChatId && currentChatId !== 'new') {
      const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
      updateChatTitle(currentChatId, newTitle);
    }
    
    setIsLoading(true);

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
          })),
          conversationId: chatId === 'new' ? undefined : chatId
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.message,
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Save AI message to localStorage with the correct chatId
        const messageKey = `chatgpt-messages-${currentChatId}`;
        localStorage.setItem(messageKey, JSON.stringify(finalMessages));
        
        // Update chat title if this is the first message (after AI response)
        if (messages.length === 0 && currentChatId && currentChatId !== 'new') {
          const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
          updateChatTitle(currentChatId, newTitle);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList): Promise<any[]> => {
    // Handle file upload
    return [];
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    // Update conversations list
    const updatedConversations = conversations.map(conv =>
      conv.id === chatId ? { ...conv, title: newTitle, updatedAt: new Date().toISOString() } : conv
    );
    setConversations(updatedConversations);
    
    // Save to localStorage
    localStorage.setItem('chatgpt-conversations', JSON.stringify(updatedConversations));
  };

  const handleNewChat = () => {
    // Create a new conversation with unique ID
    const newConversation = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    // Add to conversations list
    const updatedConversations = [newConversation, ...conversations];
    
    // Save to localStorage FIRST
    localStorage.setItem('chatgpt-conversations', JSON.stringify(updatedConversations));
    localStorage.setItem(`chatgpt-messages-${newConversation.id}`, JSON.stringify([]));
    
    // Set conversations state
    setConversations(updatedConversations);
    
    // Navigate to the new chat immediately
    router.push(`/chat/${newConversation.id}`);
  };

  const clearAllChats = () => {
    // Set flag to prevent reloading
    hasClearedRef.current = true;

    // Clear all conversations
    setConversations([]);
    setMessages([]);

    // Clear localStorage
    localStorage.removeItem('chatgpt-conversations');

    // Clear all message storage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chatgpt-messages-')) {
        localStorage.removeItem(key);
      }
    });

    // Navigate to new chat
    router.push('/chat/new');
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      // Try API call first
      await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // API delete failed, using localStorage only
    }

    // Remove from conversations list
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);

    // Save to localStorage
    localStorage.setItem('chatgpt-conversations', JSON.stringify(updatedConversations));

    // Remove messages from localStorage
    localStorage.removeItem(`chatgpt-messages-${id}`);

    // If we're currently viewing this conversation, navigate to new chat
    if (chatId === id) {
      router.push('/chat/new');
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      // Try API call first
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (error) {
      // API rename failed, using localStorage only
    }

    // Update conversations list
    const updatedConversations = conversations.map(conv =>
      conv.id === id ? { ...conv, title: newTitle, updatedAt: new Date().toISOString() } : conv
    );
    setConversations(updatedConversations);

    // Save to localStorage
    localStorage.setItem('chatgpt-conversations', JSON.stringify(updatedConversations));
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  return (
    <main className="h-screen bg-[#212121]">
      <ChatInterface
        initialConversations={conversations}
        initialMessages={messages}
        currentConversationId={chatId === 'new' ? undefined : chatId}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAllChats={clearAllChats}
      />
      <Toaster />
    </main>
  );
}