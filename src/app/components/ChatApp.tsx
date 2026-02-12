'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Conversation, Message } from '../types/chat';
import { useAppState } from '../providers/AppStateProvider';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import WorkspacesPanel from './WorkspacesPanel';

// Dummy responses from AI
const dummyResponses = [
  "That's an interesting question! Let me think about that for a moment.",
  "I'd be happy to help you with that. Here's what I think about it...",
  "Great question! This is a complex topic that requires careful consideration.",
  "I appreciate your curiosity. Let me provide you with some insights.",
  "That's something many people wonder about. Here's my perspective...",
  "Absolutely! This is a fascinating area to explore.",
  "I see what you're asking. The answer involves several key points.",
];

const MODEL_OPTIONS = ['ChatGPT 5', 'GPT-4', 'GPT-5 mini'];
const CHAT_STYLE_OPTIONS = ['Fast', 'Thinking', 'Deep research'];
const MODEL_VERSIONS: Record<string, string> = {
  'ChatGPT 5': '5',
  'GPT-4': '4',
  'GPT-5 mini': '5.2',
};

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}

export default function ChatApp() {
  const {
    conversations,
    activeConversationId,
    workspaces,
    activeWorkspaceId,
    userEmail,
    userName,
    activeGptName,
    isGptExplorerOpen,
    gptOptions,
    currentView,
    setActiveGptName,
    setConversations,
    setActiveConversationId,
    setUserEmail,
    setIsGptExplorerOpen,
  } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [selectedChatStyle, setSelectedChatStyle] = useState(
    CHAT_STYLE_OPTIONS[0]
  );
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const selectionMenuRef = useRef<HTMLDivElement | null>(null);
  const helpMenuRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  const generateTitle = (firstMessage: string) => {
    const maxLength = 30;
    return firstMessage.substring(0, maxLength) + (firstMessage.length > maxLength ? '...' : '');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (selectionMenuRef.current && !selectionMenuRef.current.contains(target)) {
        setIsSelectionOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(target)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeWorkspaceId) return;
      const userMessage: Message = {
        id: generateId(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };

      if (!activeConversationId) {
        const newConversation: Conversation = {
          id: generateId(),
          title: generateTitle(text),
          messages: [userMessage],
          workspaceId: activeWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        simulateAssistantResponse(newConversation.id);
      } else {
        const isFirstMessage = (activeConversation?.messages.length || 0) === 0;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConversationId) {
              return {
                ...c,
                messages: [...c.messages, userMessage],
                title: isFirstMessage || c.title === 'New Conversation' ? generateTitle(text) : c.title,
                updatedAt: new Date(),
              };
            }
            return c;
          })
        );
        simulateAssistantResponse(activeConversationId);
      }
    },
    [activeConversationId, activeConversation, activeWorkspaceId]
  );

  const simulateAssistantResponse = async (conversationId: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const randomResponse =
      dummyResponses[Math.floor(Math.random() * dummyResponses.length)];

    const assistantMessage: Message = {
      id: generateId(),
      text: randomResponse,
      sender: 'assistant',
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date(),
          };
        }
        return c;
      })
    );

    setIsLoading(false);
  };

  const handleAuthSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!authEmail.trim()) {
        setAuthError('Please enter an email.');
        return;
      }
      if (authPassword.length <= 6) {
        setAuthError('Password must be more than 6 characters.');
        return;
      }
      setUserEmail(authEmail.trim());
      setAuthMode(null);
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
    },
    [authEmail, authPassword, authMode]
  );

  const modelVersion = MODEL_VERSIONS[selectedModel] ?? selectedModel;
  const modelLabel = activeGptName
    ? `${activeGptName} 🔥 ${modelVersion}`
    : selectedModel;
  const signedInLabel = userName?.trim()
    ? userName
    : userEmail ?? 'Guest';

  const renderSelectionPopup = () => (
    <div className="relative" ref={selectionMenuRef}>
      <button
        type="button"
        onClick={() => setIsSelectionOpen((open) => !open)}
        className="flex items-center gap-2 text-sm text-white hover:text-gray-200"
        aria-haspopup="dialog"
        aria-expanded={isSelectionOpen}
      >
        <span className="font-semibold">{modelLabel}</span>
        <span className="text-gray-500">•</span>
        <span className="font-semibold">{selectedChatStyle}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isSelectionOpen ? 'rotate-180' : ''}`}
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
      {isSelectionOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden z-20 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Model
          </div>
          <div className="space-y-1">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedModel(option)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[#222222] ${
                  selectedModel === option ? 'text-white bg-[#222222]' : 'text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-400 mt-4 mb-2">
            Chat style
          </div>
          <div className="space-y-1">
            {CHAT_STYLE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedChatStyle(option)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[#222222] ${
                  selectedChatStyle === option ? 'text-white bg-[#222222]' : 'text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (currentView === 'workspaces') {
    return <WorkspacesPanel />;
  }

  return (
    <div className="flex-1 flex flex-col relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-[#2a2a2a] p-4 flex items-center justify-between bg-[#1f1f1f]">
              <div className="flex items-center">
                {renderSelectionPopup()}
              </div>
              <div className="flex items-center gap-2">
                {!userEmail ? (
                  <>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="px-3 py-2 rounded-full bg-white text-black hover:bg-gray-200 text-sm"
                    >
                      Log in
                    </button>
                    <div className="relative" ref={helpMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsHelpOpen((open) => !open)}
                        className="px-3 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-sm text-white border border-[#3a3a3a]"
                        aria-haspopup="dialog"
                        aria-expanded={isHelpOpen}
                        aria-label="Help"
                      >
                        ?
                      </button>
                      {isHelpOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1b1b1b] border border-[#2a2a2a] shadow-xl p-3 text-xs text-gray-300">
                          Need access? Use your EY SSO or contact your IT admin.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-gray-300">
                    Signed in as {signedInLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <ChatWindow messages={activeConversation.messages} isLoading={isLoading} />

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isWorkspaceSelected={Boolean(activeWorkspaceId)}
              workspaceName={activeWorkspace?.name ?? null}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-[#1f1f1f]">
            <div className="w-full flex justify-between items-center p-4">
              <div className="flex items-center">
                {renderSelectionPopup()}
              </div>
              {!userEmail ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 text-sm"
                  >
                    Log in
                  </button>
                  <div className="relative" ref={helpMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsHelpOpen((open) => !open)}
                      className="px-4 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-sm text-white border border-[#3a3a3a]"
                      aria-haspopup="dialog"
                      aria-expanded={isHelpOpen}
                      aria-label="Help"
                    >
                      ?
                    </button>
                    {isHelpOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1b1b1b] border border-[#2a2a2a] shadow-xl p-3 text-xs text-gray-300">
                        Need access? Use your EY SSO or contact your IT admin.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-300">Signed in as {signedInLabel}</span>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center w-full px-6">
                <h1 className="text-3xl md:text-4xl font-semibold text-white mb-8">
                  What can I help with?
                </h1>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  isWorkspaceSelected={Boolean(activeWorkspaceId)}
                  workspaceName={activeWorkspace?.name ?? null}
                />
              </div>
            </div>
          </div>
        )}

        {authMode && (
          <div className="absolute top-16 right-6 w-full max-w-sm bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Login</h2>
              <button
                onClick={() => setAuthMode(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="At least 7 characters"
                  className="w-full px-4 py-3 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                />
              </div>
              {authError && (
                <div className="text-sm text-red-400">{authError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-white hover:bg-gray-200 text-black px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
        )}

        {isGptExplorerOpen && (
          <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-6 bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Explore GPTs</h2>
                <button
                  type="button"
                  onClick={() => setIsGptExplorerOpen(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close"
                >
                  x
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gptOptions.map((gpt) => (
                  <button
                    key={gpt}
                    type="button"
                    onClick={() => {
                      setActiveGptName(gpt);
                      setIsGptExplorerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      activeGptName === gpt
                        ? 'bg-[#222222] border-[#333333] text-white'
                        : 'bg-[#141414] border-[#252525] text-gray-300 hover:bg-[#1f1f1f]'
                    }`}
                  >
                    {gpt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
