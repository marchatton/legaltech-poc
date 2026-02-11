import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Page, Matter } from '../../hooks/useOrbitalState';
import { ChevronRight, Home } from 'lucide-react';
interface GlobalShellProps {
  children: React.ReactNode;
  currentPage: Page;
  selectedMatter: Matter | null;
  onNavigate: (page: Page) => void;
  isDemoMode: boolean;
}
export function GlobalShell({
  children,
  currentPage,
  selectedMatter,
  onNavigate,
  isDemoMode
}: GlobalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex flex-1 w-full bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />


      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0 z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-muted-foreground min-w-0">
            <button
              onClick={() => onNavigate('matters')}
              className="hover:text-foreground transition-colors flex items-center flex-shrink-0">

              <Home className="w-4 h-4 mr-2" />
              Matters
            </button>

            {selectedMatter &&
            <>
                <ChevronRight className="w-4 h-4 mx-2 text-border flex-shrink-0" />
                <span className="font-medium text-foreground truncate max-w-sm">
                  {selectedMatter.name}
                </span>
                <span className="ml-2 px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono text-muted-foreground flex-shrink-0">
                  {selectedMatter.id}
                </span>
              </>
            }

            {currentPage === 'new-matter' &&
            <>
                <ChevronRight className="w-4 h-4 mx-2 text-border flex-shrink-0" />
                <span className="font-medium text-foreground">New Matter</span>
              </>
            }
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {selectedMatter &&
            <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-100 px-1.5 py-0.5 rounded">
                run_882
              </span>
            }
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isDemoMode ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>

              {isDemoMode ? 'demo-dev' : 'production'}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto relative">{children}</main>
      </div>
    </div>);

}