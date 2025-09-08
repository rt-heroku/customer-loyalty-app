'use client';

import { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [showAttachments, setShowAttachments] = useState(false);

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex",
        message.isFromUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          message.isFromUser
            ? "bg-primary-500 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border",
                  message.isFromUser
                    ? "bg-primary-400 border-primary-300"
                    : "bg-white border-gray-200"
                )}
              >
                {getFileIcon(attachment.mimeType)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {attachment.fileName}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatFileSize(attachment.fileSize)}
                  </div>
                </div>
                <button
                  onClick={() => window.open(attachment.filePath, '_blank')}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Message Footer */}
        <div
          className={cn(
            "flex items-center justify-between mt-1 text-xs",
            message.isFromUser ? "text-primary-100" : "text-gray-500"
          )}
        >
          <span>{formatTimestamp(message.timestamp)}</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
          </div>
        </div>

        {/* Suggested Actions */}
        {message.metadata?.suggestedActions && (
          <div className="mt-2 space-y-1">
            {message.metadata.suggestedActions.map((action: any, index: number) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => {
                  if (action.action === 'redirect' && action.url) {
                    window.location.href = action.url;
                  }
                }}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  message.isFromUser
                    ? "bg-primary-400 hover:bg-primary-300 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                )}
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
