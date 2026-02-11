'use client';

import { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isWorkspaceSelected?: boolean;
  workspaceName?: string | null;
}

export default function ChatInput({
  onSendMessage,
  isLoading = false,
  isWorkspaceSelected = true,
  workspaceName = null,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isWorkspaceSelected) {
      onSendMessage(input);
      setInput('');
    }
  };

  const isDisabled = isLoading || !isWorkspaceSelected;
  const placeholder = isWorkspaceSelected
    ? 'Ask anything'
    : 'Select a workspace to start chatting';

  return (
    <form onSubmit={handleSubmit} className="bg-transparent px-6 pb-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && isWorkspaceSelected) {
                  onSendMessage(input);
                  setInput('');
                }
              }
            }}
            placeholder={placeholder}
            disabled={isDisabled}
            className="w-full px-4 py-4 pr-14 bg-transparent text-white focus:outline-none disabled:opacity-70 placeholder-gray-400 resize-none overflow-hidden"
          />
          <button
            type="submit"
            disabled={isDisabled || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-black disabled:bg-gray-500 disabled:text-gray-200 flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 5l7 7-1.4 1.4L13 8.8V19h-2V8.8L6.4 13.4 5 12z" />
            </svg>
          </button>
        </div>
        {!isWorkspaceSelected && (
          <div className="mt-2 text-xs text-amber-300">
            Please select or create an EY workspace to send messages.
          </div>
        )}
        {isWorkspaceSelected && workspaceName && (
          <div className="mt-2 text-xs text-gray-400">
            Workspace: {workspaceName}
          </div>
        )}
      </div>
    </form>
  );
}
