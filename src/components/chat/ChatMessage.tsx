'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Edit3, 
  Check, 
  X,
  Image as ImageIcon,
  FileText,
  Download,
  RotateCcw
} from 'lucide-react';

interface Attachment {
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
}

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  isEditing?: boolean;
  onEdit?: (id: string, newContent: string) => void;
  onCancelEdit?: (id: string) => void;
  onSaveEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (content: string) => void;
}

export default function ChatMessage({
  id,
  role,
  content,
  timestamp: _timestamp,
  attachments = [],
  isEditing = false,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onRegenerate,
  onCopy
}: ChatMessageProps) {
  const [editContent, setEditContent] = useState(content);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    if (onSaveEdit && editContent.trim()) {
      onSaveEdit(id, editContent.trim());
    }
  };

  const handleCancel = () => {
    setEditContent(content);
    if (onCancelEdit) {
      onCancelEdit(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`group relative chatgpt-message-container ${role === 'user' ? 'chatgpt-user-message' : 'chatgpt-ai-message'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl ml-auto py-6 px-6">
        <div className={`flex gap-4 items-start ${role === 'user' ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                role === 'user'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-white'
              }`}>
              {role === 'user' ? 'U' : 'AI'}
            </div>
          </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg text-sm"
                  >
                    {attachment.type === 'image' ? (
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-gray-700">{attachment.name}</span>
                    <span className="text-gray-500 text-xs">
                      ({formatFileSize(attachment.size)})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Message Content */}
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none text-white bg-gray-1200 border-gray-600 placeholder-gray-400"
                  placeholder="Edit your message..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!editContent.trim()}
                    className="cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
                  <div className={`prose prose-sm max-w-none ${role === 'user' ? 'text-right text-white' : 'text-white'}`}>
                    <div className={`inline-block ${role === 'user' ? 'user-message-bubble' : 'ai-message-bubble'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
                    </div>
                  </div>
            )}

            {/* Action Buttons - Different for user vs AI messages */}
            {!isEditing && (
              <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${role === 'user' ? 'justify-end' : ''}`}>
                {role === 'user' ? (
                  // User message actions - edit and copy buttons, right aligned below message
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit && onEdit(id, content)}
                      className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                      title="Edit message"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopy && onCopy(content)}
                      className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  // AI message actions - only copy button
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopy && onCopy(content)}
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-700 text-gray-300"
                    title="Copy message"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}