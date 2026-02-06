'use client';

import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className="px-4 sm:px-8 lg:px-24 mb-4">
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-2xl bg-gray-800 text-white px-4 py-3 rounded-lg">
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-100">{message.text}</p>
        </div>
      )}
    </div>
  );
}
