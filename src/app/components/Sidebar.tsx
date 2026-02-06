'use client';

import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  userEmail: string | null;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  userEmail,
}: SidebarProps) {
  const displayName = userEmail ? userEmail.split('@')[0] : 'Guest';
  return (
    <div className="w-64 bg-[#111111] text-white flex flex-col h-screen border-r border-[#1f1f1f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1f1f1f]">
        <button
          onClick={onNewConversation}
          className="w-full bg-[#1b1b1b] hover:bg-[#222222] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-[#262626]"
        >
          <span>+</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">No conversations yet</div>
        ) : (
          <div className="p-2">
            <div className="px-2 py-2 text-xs uppercase tracking-widest text-gray-500">
              Your chats
            </div>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer group relative ${
                  activeConversationId === conversation.id
                    ? 'bg-[#222222]'
                    : 'hover:bg-[#1b1b1b]'
                } transition-colors`}
              >
                <p className="text-sm truncate pr-8">{conversation.title}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  aria-label="Delete conversation"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-[#3a1c1c] hover:bg-[#4a1f1f] p-1 rounded transition-all"
                  title="Delete conversation"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-[#1f1f1f] rounded-full flex items-center justify-center">
            👤
          </div>
          <span>{displayName}</span>
        </div>
      </div>
    </div>
  );
}
