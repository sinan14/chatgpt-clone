'use client';

import { useEffect, useRef } from 'react';

interface MultiSelectProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value: string[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onChange: (value: string[]) => void;
}

export default function MultiSelect({
  id,
  label,
  required = false,
  placeholder,
  options,
  value,
  openId,
  setOpenId,
  onChange,
}: MultiSelectProps) {
  const isOpen = openId === id;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        if (isOpen) setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpenId]);

  const toggleValue = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const displayText = value.length === 0 ? placeholder : value.join(', ');

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full h-8 px-3 rounded-lg bg-[#141414] border border-[#2a2a2a] text-sm text-white hover:bg-[#1b1b1b] flex items-center justify-between gap-2"
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden z-20 max-h-56 overflow-y-auto">
          {options.map((option) => {
            const isChecked = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleValue(option)}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#222222] flex items-center gap-2"
              >
                <span
                  className={`w-4 h-4 rounded border border-[#3a3a3a] flex items-center justify-center ${
                    isChecked ? 'bg-white text-black' : 'bg-transparent'
                  }`}
                >
                  {isChecked ? '✓' : ''}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
