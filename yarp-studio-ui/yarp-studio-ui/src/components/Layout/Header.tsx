import React from 'react'
import { RefreshCw, Sun, Moon, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useApp } from '../../context/AppContext'

export const Header: React.FC = () => {
  const {
    theme,
    setTheme,
    isSaving,
    isRefreshingStatus,
    fetchStatus,
    handleSaveConfig,
    validationErrors
  } = useApp()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
          Y
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            Yarp.Studio
          </span>
          <span className="ml-2 text-xs font-medium text-slate-400 dark:text-slate-500">v1.0.0</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Refresh Health Button */}
        <Button 
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={isRefreshingStatus}
          className="text-xs h-9 border-slate-200 dark:border-slate-800"
          title="Refresh Live Destination Health Check Probe Statuses"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
          Refresh Health
        </Button>

        {/* Theme Switcher Toggle */}
        <div className="flex h-9 items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 shadow-sm">
          <Sun className={`h-3.5 w-3.5 transition-colors ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Toggle Theme"
          />
          <Moon className={`h-3.5 w-3.5 transition-colors ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
        </div>

        {/* Apply Config Button */}
        <Button 
          onClick={handleSaveConfig} 
          disabled={isSaving || validationErrors.length > 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/10 text-xs h-9"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Apply Config
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
