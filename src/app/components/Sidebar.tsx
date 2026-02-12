'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';

export default function Sidebar() {
  const {
    conversations,
    activeConversationId,
    activeWorkspaceId,
    userEmail,
    userName,
    setCurrentView,
    createConversation,
    deleteConversation,
    selectConversation,
    logout,
  } = useAppState();
  const displayName = userName?.trim()
    ? userName
    : userEmail
    ? userEmail.split('@')[0]
    : 'Guest';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const accountLabel = userName?.trim()
    ? userName
    : userEmail ?? 'guest@chatgpt.local';
  const visibleConversations = activeWorkspaceId
    ? conversations.filter((c) => c.workspaceId === activeWorkspaceId)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 bg-[#111111] text-white flex flex-col h-screen border-r border-[#1f1f1f]">
      {/* Header */}
      <div className="p-3 border-b border-[#1f1f1f]">
        <button
          type="button"
          onClick={() => setCurrentView('chat')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1b1b1b]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </button>
      </div>

      {/* Workspace Link */}
      <div className="p-3 border-b border-[#1f1f1f]">
        <div className="px-2 py-2 text-xs uppercase tracking-widest text-gray-500">
          Workspace
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('workspaces')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1b1b1b]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6.5C4 5.12 5.12 4 6.5 4h11c1.38 0 2.5 1.12 2.5 2.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7.5 8.5h9M7.5 12h9M7.5 15.5h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>Workspaces</span>
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3 border-b border-[#1f1f1f]">
        <button
          type="button"
          onClick={createConversation}
          disabled={!activeWorkspaceId}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1b1b1b] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>+</span>
          <span>New chat</span>
        </button>
        {!activeWorkspaceId && (
          <div className="mt-2 text-xs text-amber-300">
            Select an EY workspace to start.
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            type="button"
            onClick={() => setIsChatsOpen((open) => !open)}
            className="w-full flex items-center justify-between px-2 py-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300"
            aria-expanded={isChatsOpen}
          >
            <span>Your chats</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isChatsOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isChatsOpen && (
            <>
              {visibleConversations.length === 0 ? (
                <div className="p-4 text-gray-400 text-sm">No conversations yet</div>
              ) : (
                visibleConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
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
                        deleteConversation(conversation.id);
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
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1f1f1f] relative" ref={menuRef}>
        {isUserMenuOpen && (
          <div className="absolute bottom-16 left-4 w-56 bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">
              Account
            </div>
            <div className="px-3 py-2 flex items-center gap-2 text-sm text-gray-200 border-b border-[#262626]">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6.5C4 5.12 5.12 4 6.5 4h11c1.38 0 2.5 1.12 2.5 2.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.5 8.5h9M7.5 12h9M7.5 15.5h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="truncate">{accountLabel}</span>
            </div>
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center gap-2 text-sm text-gray-200 hover:bg-[#222222]"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12l8-4.5M12 12L4 7.5M12 12v9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Settings</span>
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center gap-2 text-sm text-gray-200 hover:bg-[#222222]"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.7.7-1.5 1-1.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Help</span>
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center gap-2 text-sm text-red-300 hover:bg-[#2a1d1d]"
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
            >
              <svg className="w-4 h-4 text-red-300" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10 17l5-5-5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12H4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsUserMenuOpen((open) => !open)}
          className="w-full flex items-center gap-3 text-sm hover:bg-[#1b1b1b] rounded-lg px-2 py-2"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
        >
          <div className="w-8 h-8 bg-[#1f1f1f] rounded-full flex items-center justify-center text-sm">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <span className="truncate">{displayName}</span>
        </button>
      </div>
    </div>
  );
}
