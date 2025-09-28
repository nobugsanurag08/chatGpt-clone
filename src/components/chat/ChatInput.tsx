'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, ArrowUp, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: FileList) => Promise<Attachment[]>;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  onFileUpload,
  isLoading,
  placeholder = 'Ask anything',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmitInternal = async () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) {
      return;
    }

    let uploadedAttachments: Attachment[] = [];
    if (attachments.length > 0) {
      try {
        uploadedAttachments = await onFileUpload(fileInputRef.current?.files as FileList);
      } catch (error) {
        toast.error('Failed to upload files');
        console.error('Upload error:', error);
        return;
      }
    }

    onSendMessage(message);
    setMessage('');
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInternal();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newAttachments: Attachment[] = Array.from(selectedFiles).map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="chatgpt-input-container bg-[#212121]">
      <div className="w-full">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-md p-2 text-sm text-gray-700"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-500" />
                )}
                <span>{attachment.name}</span>
                <span className="text-gray-500 text-xs">
                  ({formatFileSize(attachment.size)})
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-2 pb-0 border border-gray-500 rounded-3xl bg-[#2f2f2f] shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all min-h-[44px]">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0 cursor-pointer text-gray-400 hover:text-gray-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[44px] max-h-32 resize-none border-0 focus:ring-0 focus:outline-none p-0 bg-transparent text-white placeholder-gray-400 text-base flex items-center"
            disabled={isLoading}
          />
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={handleSubmitInternal}
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
              className="h-8 w-8 p-0 cursor-pointer bg-white hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowUp className="h-4 w-4 text-gray-800" />
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center bg-transparent">
          ChatGPT can make mistakes. Check important info. <span className="underline cursor-pointer">See Cookie Preferences.</span>
        </div>
      </div>
    </div>
  );
}