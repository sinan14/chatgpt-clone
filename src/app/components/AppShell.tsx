'use client';

import { useEffect, useState } from 'react';
import { AppStateProvider } from '../providers/AppStateProvider';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#1f1f1f]" />;
  }

  return (
    <AppStateProvider>
      <div className="flex h-screen bg-[#1f1f1f] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col relative">{children}</div>
      </div>
    </AppStateProvider>
  );
}
