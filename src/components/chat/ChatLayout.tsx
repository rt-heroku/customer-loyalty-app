'use client';

import { useChat } from '@/contexts/ChatContext';
import ChatWindow from './ChatWindow';
import FloatingChatButton from './FloatingChatButton';

export default function ChatLayout() {
  const { 
    chatState, 
    openChat, 
    closeChat, 
    minimizeChat, 
    maximizeChat,
    shouldShowFloatingButton 
  } = useChat();

  return (
    <>
      <ChatWindow
        isOpen={chatState.isOpen}
        onClose={closeChat}
        onMinimize={minimizeChat}
        onMaximize={maximizeChat}
      />
      {shouldShowFloatingButton && (
        <FloatingChatButton
          onClick={openChat}
          unreadCount={chatState.unreadCount}
          isVisible={!chatState.isOpen}
        />
      )}
    </>
  );
}
