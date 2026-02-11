'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Conversation, Workspace } from '../types/chat';
import {
  ACTIVE_WORKSPACE_KEY,
  WORKSPACES_KEY,
  deserializeWorkspaces,
  serializeWorkspaces,
} from '../lib/workspace';

const STORAGE_KEY = 'chatgpt_clone_conversations_v1';
const ACTIVE_ID_KEY = 'chatgpt_clone_active_id_v1';
const USER_EMAIL_KEY = 'chatgpt_clone_user_email_v1';
const USER_NAME_KEY = 'chatgpt_clone_user_name_v1';

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
      workspaceId: c.workspaceId ? String(c.workspaceId) : null,
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

interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  userEmail: string | null;
  userName: string | null;
  activeGptName: string | null;
  isGptExplorerOpen: boolean;
  currentView: 'chat' | 'workspaces';
  gptOptions: string[];
  setActiveGptName: (name: string | null) => void;
  setIsGptExplorerOpen: (open: boolean) => void;
  setCurrentView: (view: 'chat' | 'workspaces') => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setUserName: (name: string | null) => void;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveConversationId: (id: string | null) => void;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  selectConversation: (id: string) => void;
  logout: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [activeGptName, setActiveGptName] = useState<string | null>(null);
  const [isGptExplorerOpen, setIsGptExplorerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'workspaces'>('chat');

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
    const storedWorkspaces = localStorage.getItem(WORKSPACES_KEY);
    if (storedWorkspaces) {
      try {
        const parsed = JSON.parse(storedWorkspaces);
        setWorkspaces(deserializeWorkspaces(parsed));
      } catch {
        setWorkspaces([]);
      }
    }
    const activeId = localStorage.getItem(ACTIVE_ID_KEY);
    if (activeId) setActiveConversationId(activeId);
    const activeWsId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    if (activeWsId) setActiveWorkspaceId(activeWsId);
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    if (storedEmail) setUserEmail(storedEmail);
    const storedName = localStorage.getItem(USER_NAME_KEY);
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeConversations(conversations)));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(serializeWorkspaces(workspaces)));
  }, [workspaces]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_ID_KEY, activeConversationId);
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspaceId);
    } else {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
  }, [activeWorkspaceId]);

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
    if (!activeWorkspaceId) {
      setActiveConversationId(null);
      return;
    }
    const workspaceConversations = conversations.filter(
      (c) => c.workspaceId === activeWorkspaceId
    );
    if (!workspaceConversations.some((c) => c.id === activeConversationId)) {
      setActiveConversationId(workspaceConversations[0]?.id ?? null);
    }
  }, [activeWorkspaceId, activeConversationId, conversations]);

  const createConversation = () => {
    if (!activeWorkspaceId) return;
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      workspaceId: activeWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const logout = () => {
    setConversations([]);
    setActiveConversationId(null);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    setUserEmail(null);
    setUserName(null);
    setActiveGptName(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ID_KEY);
    localStorage.removeItem(WORKSPACES_KEY);
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  };

  const value = useMemo(
    () => ({
      conversations,
      activeConversationId,
      workspaces,
      activeWorkspaceId,
      userEmail,
      userName,
      activeGptName,
      isGptExplorerOpen,
      currentView,
      gptOptions: GPT_OPTIONS,
      setActiveGptName,
      setIsGptExplorerOpen,
      setCurrentView,
      setActiveWorkspaceId,
      setUserEmail,
      setUserName,
      setWorkspaces,
      setConversations,
      setActiveConversationId,
      createConversation,
      deleteConversation,
      selectConversation,
      logout,
    }),
    [
      conversations,
      activeConversationId,
      workspaces,
      activeWorkspaceId,
      userEmail,
      userName,
      activeGptName,
      isGptExplorerOpen,
      currentView,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
