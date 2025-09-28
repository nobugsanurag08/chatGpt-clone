'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import LoginScreen from '@/components/auth/LoginScreen';
import { Toaster } from '@/components/ui/sonner';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Load conversations from API
    const loadConversations = async () => {
      try {
        // For demo purposes, we'll use mock data
        // In production, you'd fetch from your API
        const mockConversations: Conversation[] = [
          {
            id: '1',
            title: 'Help with React',
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Python Programming',
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        setConversations(mockConversations);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      // Redirect to chat page after login
      router.push('/chat/new');
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleSendMessage = (content: string, attachments?: any[]) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a demo response. Configure your OpenAI API key to enable real AI chat.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = async (files: FileList): Promise<any[]> => {
    // Handle file upload
    return [];
  };


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <LoginScreen onLogin={() => window.location.href = '/sign-in'} />
    );
  }

  return (
    <main className="h-screen bg-[#212121]">
      <ChatInterface
        initialConversations={conversations}
        initialMessages={messages}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
      <Toaster />
    </main>
  );
}