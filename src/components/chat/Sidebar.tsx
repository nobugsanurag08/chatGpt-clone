'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserButton, useUser } from '@clerk/nextjs';
// import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAllChats?: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAllChats,
  isMobileOpen,
  onMobileToggle,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');


  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}
      
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 bg-[#181818] text-white
            transform transition-all duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-16' : 'w-64'}
            flex flex-col overflow-hidden chatgpt-sidebar relative
          `}>
        {/* Header */}
        <div className="p-3 flex flex-col gap-2 relative pr-12">
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileToggle}
            className="lg:hidden absolute top-2 right-2 text-white hover:bg-gray-700 cursor-pointer bg-transparent rounded-md p-1 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onNewChat();
                  // Close mobile sidebar when new chat is created
                  onMobileToggle();
                }}
                className={`w-full flex items-center gap-2 text-white border-gray-600 hover:bg-gray-700 cursor-pointer bg-transparent rounded-md ${isCollapsed ? 'justify-center' : ''}`}
              >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>New chat</span>}
          </Button>
          
          {!isCollapsed && conversations.length > 0 && onClearAllChats && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
                      onClearAllChats();
                    }
                  }}
                  className="w-full flex items-center gap-2 text-red-400 border-red-600 hover:bg-red-900/20 cursor-pointer bg-transparent rounded-md"
                >
              <Trash2 className="h-4 w-4" />
              <span>Clear all chats</span>
            </Button>
          )}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onMobileToggle}
            className="lg:hidden absolute top-3 right-3 text-white hover:bg-gray-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </div>

        {/* Conversations List */}
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1">
                {conversations.filter(conv => conv && conv.id).map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`
                      group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer chatgpt-sidebar-item
                      hover:bg-gray-700 transition-colors
                      ${currentConversationId === conversation.id ? 'bg-gray-700' : 'bg-transparent'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      // Close mobile sidebar when conversation is selected
                      onMobileToggle();
                    }}
                  >
                    {editingId === conversation.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          onBlur={handleSaveRename}
                          className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate text-sm text-gray-200">
                              {conversation.title}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRename(conversation.id, conversation.title);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(conversation.id);
                                  }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

        {/* Footer - User Profile */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-[#2d2d2d] border border-[#404040]",
                  userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-gray-700/50",
                  userButtonPopoverActionButtonText: "text-gray-300",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
            {!isCollapsed && (
              <span className="text-gray-300 text-sm">
                {user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'}
              </span>
            )}
          </div>
        </div>

        {/* Collapse/Expand Button - Rightmost edge */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // On mobile, hide sidebar completely (like clicking outside)
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                onMobileToggle();
              } else {
                // On desktop, toggle collapse
                onToggleCollapse();
              }
            }}
            data-collapse="true"
            className="absolute top-3 right-2 text-white hover:bg-gray-700 cursor-pointer bg-gray-600 p-1 z-20 w-8 h-8"
          >
            {/* Show X on mobile, arrows on desktop */}
            <div className="lg:hidden">
              <X className="h-3 w-3" />
            </div>
            <div className="hidden lg:block">
              {isCollapsed ? (
                <ArrowRightFromLine className="h-3 w-3" />
              ) : (
                <ArrowLeftFromLine className="h-3 w-3" />
              )}
            </div>
          </Button>
        )}
      </div>
    </>
  );
}
