import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { IngestModal } from '../modals/IngestModal';

export const Layout: React.FC = () => {
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  return (
    <div className="flex h-screen bg-paper-100 font-sans text-charcoal-800 overflow-hidden">
      {/* Permanent Sidebar */}
      <Sidebar onOpenIngest={() => setIsIngestOpen(true)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenIngest={() => setIsIngestOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Ingest Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
      />
    </div>
  );
};
