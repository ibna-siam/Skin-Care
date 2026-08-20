import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../components/admin/AdminTopbar';
import { AdminCommandPalette } from '../../components/admin/AdminCommandPalette';
import { AdminQuickActionsModal } from '../../components/admin/AdminQuickActionsModal';
import { useAdminThemeStore } from '../../stores/adminThemeStore';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  const { resolvedTheme } = useAdminThemeStore();

  // Listen for global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen font-sans flex transition-colors duration-200 ${
        resolvedTheme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Enterprise Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Enterprise Topbar */}
        <AdminTopbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickAction={(action) => setActiveQuickAction(action)}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAction={(action) => setActiveQuickAction(action)}
      />

      {/* Quick Action Dispatcher */}
      <AdminQuickActionsModal
        activeAction={activeQuickAction}
        onClose={() => setActiveQuickAction(null)}
      />
    </div>
  );
};
