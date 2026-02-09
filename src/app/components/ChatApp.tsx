'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Conversation, Message } from '../types/chat';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

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

const STORAGE_KEY = 'chatgpt_clone_conversations_v1';
const ACTIVE_ID_KEY = 'chatgpt_clone_active_id_v1';
const USER_EMAIL_KEY = 'chatgpt_clone_user_email_v1';
const USER_NAME_KEY = 'chatgpt_clone_user_name_v1';
const MODEL_OPTIONS = ['ChatGPT 5', 'GPT-4', 'GPT-5 mini'];
const MODEL_VERSIONS: Record<string, string> = {
  'ChatGPT 5': '5',
  'GPT-4': '4',
  'GPT-5 mini': '5.2',
};
const GPT_OPTIONS = [
  'Audit',
  'Tax',
  'Tech consulting',
  'Business consulting',
  'forensic',
  'SAP',
  'ASSURANCE',
];

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}

function serializeConversations(conversations: Conversation[]) {
  return conversations.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    messages: c.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    })),
  }));
}

function deserializeConversations(raw: unknown): Conversation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c === 'object')
    .map((c: any) => ({
      id: String(c.id),
      title: String(c.title ?? 'Conversation'),
      createdAt: new Date(c.createdAt ?? Date.now()),
      updatedAt: new Date(c.updatedAt ?? Date.now()),
      messages: Array.isArray(c.messages)
        ? c.messages.map((m: any) => ({
            id: String(m.id),
            text: String(m.text ?? ''),
            sender: m.sender === 'assistant' ? 'assistant' : 'user',
            timestamp: new Date(m.timestamp ?? Date.now()),
          }))
        : [],
    }));
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [activeGptName, setActiveGptName] = useState<string | null>(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);
  const [isGptExplorerOpen, setIsGptExplorerOpen] = useState(false);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const generateTitle = (firstMessage: string) => {
    const maxLength = 30;
    return firstMessage.substring(0, maxLength) + (firstMessage.length > maxLength ? '...' : '');
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(deserializeConversations(parsed));
      } catch {
        setConversations([]);
      }
    }
    const activeId = localStorage.getItem(ACTIVE_ID_KEY);
    if (activeId) setActiveConversationId(activeId);
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    if (storedEmail) setUserEmail(storedEmail);
    const storedName = localStorage.getItem(USER_NAME_KEY);
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeConversations(conversations)));
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_ID_KEY, activeConversationId);
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(USER_EMAIL_KEY, userEmail);
    } else {
      localStorage.removeItem(USER_EMAIL_KEY);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem(USER_NAME_KEY, userName);
    } else {
      localStorage.removeItem(USER_NAME_KEY);
    }
  }, [userName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modelMenuRef.current) return;
      if (!modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeConversationId && !conversations.some((c) => c.id === activeConversationId)) {
      setActiveConversationId(null);
    }
  }, [activeConversationId, conversations]);

  const handleNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
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
    [activeConversationId, activeConversation]
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

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const handleSelectGpt = useCallback((name: string) => {
    setActiveGptName(name);
  }, []);

  const handleAuthSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (authMode === 'signup' && !authName.trim()) {
        setAuthError('Please enter your name.');
        return;
      }
      if (!authEmail.trim()) {
        setAuthError('Please enter an email.');
        return;
      }
      if (authPassword.length <= 6) {
        setAuthError('Password must be more than 6 characters.');
        return;
      }
      setUserEmail(authEmail.trim());
      if (authMode === 'signup') {
        setUserName(authName.trim());
      }
      setAuthMode(null);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
    },
    [authEmail, authPassword, authMode, authName]
  );

  const handleLogout = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    setUserEmail(null);
    setUserName(null);
    setAuthMode(null);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  }, []);

  const modelVersion = MODEL_VERSIONS[selectedModel] ?? selectedModel;
  const modelLabel = activeGptName
    ? `${activeGptName} 🔥 ${modelVersion}`
    : selectedModel;
  const signedInLabel = userName?.trim()
    ? userName
    : userEmail ?? 'Guest';

  const renderModelSelector = () => (
    <div className="relative" ref={modelMenuRef}>
      <button
        type="button"
        onClick={() => setIsModelMenuOpen((open) => !open)}
        className="flex items-center gap-2 text-sm text-white hover:text-gray-200"
        aria-haspopup="menu"
        aria-expanded={isModelMenuOpen}
      >
        <span className="font-semibold">{modelLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`}
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
      {isModelMenuOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden z-20">
              {MODEL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelectedModel(option);
                setIsModelMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#222222] ${
                selectedModel === option ? 'text-white' : 'text-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1f1f1f] text-white">
      {/* Sidebar */}
      {!(conversations.length === 0 && !userEmail) && (
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          userEmail={userEmail}
          userName={userName}
          activeGptName={activeGptName}
          onSelectGpt={handleSelectGpt}
          gptOptions={GPT_OPTIONS}
          onOpenGptExplorer={() => setIsGptExplorerOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-[#2a2a2a] p-4 flex items-center justify-between bg-[#1f1f1f]">
              <div className="flex flex-col gap-2">{renderModelSelector()}</div>
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
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError('');
                      }}
                      className="px-3 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-sm text-white border border-[#3a3a3a]"
                    >
                      Sign up for free
                    </button>
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
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-[#1f1f1f]">
            <div className="w-full flex justify-between items-center p-4">
              {renderModelSelector()}
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
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="px-4 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-sm text-white border border-[#3a3a3a]"
                  >
                    Sign up for free
                  </button>
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
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          </div>
        )}

        {authMode && (
          <div className="absolute top-16 right-6 w-full max-w-sm bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button
                onClick={() => setAuthMode(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                  />
                </div>
              )}
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
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
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
                {GPT_OPTIONS.map((gpt) => (
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
    </div>
  );
}
