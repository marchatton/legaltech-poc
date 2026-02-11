import React from 'react';
import {
  LayoutGrid,
  PlayCircle,
  Bell,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight } from
'lucide-react';
import { Page } from '../../hooks/useOrbitalState';
interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}
export function Sidebar({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const navItems = [
  {
    id: 'matters',
    label: 'Matters',
    icon: LayoutGrid,
    page: 'matters' as Page
  },
  {
    id: 'runs',
    label: 'Runs',
    icon: PlayCircle,
    page: 'matters' as Page
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: Bell,
    page: 'matters' as Page
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    page: 'matters' as Page
  }];

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col h-full flex-shrink-0 transition-all duration-200`}>

      {/* Logo Area */}
      <div
        className={`h-14 flex items-center border-b border-sidebar-border ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>

        <div
          className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>

          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 ring-2 ring-purple-200 ring-offset-1 ring-offset-sidebar">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
          {!isCollapsed &&
          <span className="font-serif font-semibold text-xl text-sidebar-foreground tracking-tight ml-3 truncate">
              Orbital
            </span>
          }
        </div>
        {!isCollapsed &&
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          title="Collapse sidebar">

            <ChevronsLeft className="w-4 h-4" />
          </button>
        }
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.id === 'matters';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.page)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-cyan-50 text-cyan-800 border-l-[3px] border-cyan-500 shadow-sm' : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-[3px] border-transparent'}`}>

              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-muted-foreground'}`} />

              {!isCollapsed &&
              <span className="ml-3 truncate">{item.label}</span>
              }
            </button>);

        })}
      </nav>

      {/* Expand button — only when collapsed, sits above user profile */}
      {isCollapsed &&
      <div className="px-2 pb-2">
          <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Expand sidebar">

            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      }

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>

          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium text-xs flex-shrink-0">
            JD
          </div>
          {!isCollapsed &&
          <>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Jane Doe
                </p>
                <p className="text-xs text-muted-foreground">Operator</p>
              </div>
              <LogOut className="w-4 h-4 ml-auto text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" />
            </>
          }
        </div>
      </div>
    </div>);

}