import React from 'react'
import { RefreshCw, Sun, Moon, Save, Menu, FileJson } from 'lucide-react'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useApp } from '../../context/AppContext'

export const Header: React.FC = () => {
  const {
    theme,
    setTheme,
    isSaving,
    hasChanges,
    isRefreshingStatus,
    fetchStatus,
    handleSaveConfig,
    validationErrors,
    isSmallScreen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isRightPanelCollapsed,
    setIsRightPanelCollapsed
  } = useApp()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-6 shadow-sm z-30 relative" role="banner" aria-label="Main Application Header">
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Navigation Sidebar Toggle */}
        {isSmallScreen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="h-9 w-9 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={isSidebarCollapsed ? "Open navigation sidebar" : "Close navigation sidebar"}
            aria-expanded={!isSidebarCollapsed}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20" aria-hidden="true">
          Y
        </div>
        <div>
          <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            Yarp.Studio
          </span>
          <span className="ml-1.5 text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">v1.0.0</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Refresh Health Button */}
        <Button 
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={isRefreshingStatus}
          className="text-xs h-9 border-slate-200 dark:border-slate-800 px-2.5 sm:px-3 focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Refresh Live Destination Health Statuses"
          aria-label="Refresh live health status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingStatus ? 'animate-spin' : ''} sm:mr-2`} />
          <span className="hidden sm:inline">Refresh Health</span>
        </Button>

        {/* Theme Switcher Toggle */}
        <div className="flex h-9 items-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 sm:px-2.5 shadow-sm">
          <Sun className={`h-3.5 w-3.5 transition-colors ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} aria-hidden="true" />
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Switch between dark and light mode"
          />
          <Moon className={`h-3.5 w-3.5 transition-colors ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} aria-hidden="true" />
        </div>

        {/* Apply Config Button */}
        <Button 
          onClick={handleSaveConfig} 
          disabled={isSaving || !hasChanges || validationErrors.length > 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/10 text-xs h-9 px-2.5 sm:px-3 focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Apply Configuration Changes and trigger Hot-reload"
          aria-label="Apply current configuration changes"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin sm:mr-2" />
              <span className="hidden sm:inline">Applying...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Apply Config</span>
            </>
          )}
        </Button>

        {/* Mobile Configuration Footprint Drawer Toggle */}
        {isSmallScreen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)} 
            className="h-9 w-9 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={isRightPanelCollapsed ? "Open configuration details panel" : "Close configuration details panel"}
            aria-expanded={!isRightPanelCollapsed}
          >
            <FileJson className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
