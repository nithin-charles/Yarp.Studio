import React from 'react'
import { 
  Network, 
  Layers, 
  Server, 
  PlayCircle, 
  PanelLeftClose, 
  PanelLeftOpen,
  Check,
  AlertTriangle 
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useApp } from '../../context/AppContext'

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    routes,
    clusters,
    notification
  } = useApp()

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16 px-2' : 'w-64 p-4'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shrink-0 transition-all duration-300 py-4`}>
      <div className="space-y-6">
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace</p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="h-6 w-6 text-slate-400 hover:text-slate-600"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(false)} 
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </Button>
          </div>
        )}
        <nav className={`mt-2 ${isSidebarCollapsed ? 'space-y-3' : 'space-y-1'}`}>
          <Button 
            onClick={() => setActiveView('overview')}
            variant={activeView === 'overview' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'}`}
            title="Overview Map"
          >
            <Network className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-indigo-500`} />
            {!isSidebarCollapsed && <span>Overview Map</span>}
          </Button>
          
          <Button 
            onClick={() => setActiveView('routes')}
            variant={activeView === 'routes' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10 relative' : 'justify-start text-left'}`}
            title="Routes"
          >
            <Layers className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-purple-500`} />
            {!isSidebarCollapsed && (
              <>
                <span>Routes</span>
                {routes.length > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                    {routes.length}
                  </Badge>
                )}
              </>
            )}
            {isSidebarCollapsed && routes.length > 0 && (
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            )}
          </Button>
          
          <Button 
            onClick={() => setActiveView('clusters')}
            variant={activeView === 'clusters' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10 relative' : 'justify-start text-left'}`}
            title="Clusters"
          >
            <Server className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-emerald-500`} />
            {!isSidebarCollapsed && (
              <>
                <span>Clusters</span>
                {clusters.length > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    {clusters.length}
                  </Badge>
                )}
              </>
            )}
            {isSidebarCollapsed && clusters.length > 0 && (
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </Button>
          
          <Button 
            onClick={() => setActiveView('playground')}
            variant={activeView === 'playground' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'}`}
            title="Routing Playground"
          >
            <PlayCircle className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-rose-500`} />
            {!isSidebarCollapsed && <span>Routing Playground</span>}
          </Button>
        </nav>
      </div>

      <div className="space-y-4">
        {notification && !isSidebarCollapsed && (
          <div className={`p-3 rounded-md border text-xs flex items-start space-x-2 animate-in fade-in-50 duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' 
              : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
          }`}>
            <div className="mt-0.5 shrink-0">
              {notification.type === 'success' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            </div>
            <div className="flex-1 overflow-hidden break-words">{notification.message}</div>
          </div>
        )}
      </div>
    </aside>
  )
}
