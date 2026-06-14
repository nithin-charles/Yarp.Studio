import React from 'react'
import { 
  Network, 
  Layers, 
  Server, 
  PlayCircle, 
  PanelLeftClose, 
  PanelLeftOpen
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
    isSmallScreen
  } = useApp()

  const asideClasses = isSmallScreen
    ? `${isSidebarCollapsed ? 'w-0 overflow-hidden p-0 border-r-0' : 'w-64 p-4 fixed inset-y-14 left-0 z-50 h-[calc(100vh-3.5rem)] shadow-xl'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between transition-all duration-300 py-4`
    : `${isSidebarCollapsed ? 'w-16 px-2' : 'w-64 p-4'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shrink-0 transition-all duration-300 py-4`

  return (
    <aside 
      className={asideClasses} 
      role="complementary" 
      aria-label="Navigation Sidebar"
      aria-hidden={isSmallScreen && isSidebarCollapsed}
    >
      <div className="space-y-6">
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace</p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="h-6 w-6 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Collapse Sidebar"
              aria-label="Collapse sidebar navigation panel"
            >
              <PanelLeftClose className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}
        {isSidebarCollapsed && !isSmallScreen && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(false)} 
              className="h-8 w-8 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Expand Sidebar"
              aria-label="Expand sidebar navigation panel"
            >
              <PanelLeftOpen className="h-4.5 w-4.5" aria-hidden="true" />
            </Button>
          </div>
        )}
        <nav className={`mt-2 ${isSidebarCollapsed ? 'space-y-3' : 'space-y-1'}`} aria-label="Primary Navigation">
          <Button 
            onClick={() => {
              setActiveView('overview')
              if (isSmallScreen) setIsSidebarCollapsed(true)
            }}
            variant={activeView === 'overview' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'} focus-visible:ring-2 focus-visible:ring-indigo-500`}
            title="Overview Map"
            aria-label="Overview Map"
            aria-current={activeView === 'overview' ? 'page' : undefined}
          >
            <Network className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-indigo-500`} aria-hidden="true" />
            {!isSidebarCollapsed && <span>Overview Map</span>}
          </Button>
          
          <Button 
            onClick={() => {
              setActiveView('routes')
              if (isSmallScreen) setIsSidebarCollapsed(true)
            }}
            variant={activeView === 'routes' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10 relative' : 'justify-start text-left'} focus-visible:ring-2 focus-visible:ring-indigo-500`}
            title="Routes"
            aria-label={`Routes list, containing ${routes.length} configured routes`}
            aria-current={activeView === 'routes' ? 'page' : undefined}
          >
            <Layers className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-purple-500`} aria-hidden="true" />
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
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" aria-hidden="true" />
            )}
          </Button>
          
          <Button 
            onClick={() => {
              setActiveView('clusters')
              if (isSmallScreen) setIsSidebarCollapsed(true)
            }}
            variant={activeView === 'clusters' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10 relative' : 'justify-start text-left'} focus-visible:ring-2 focus-visible:ring-indigo-500`}
            title="Clusters"
            aria-label={`Clusters list, containing ${clusters.length} configured clusters`}
            aria-current={activeView === 'clusters' ? 'page' : undefined}
          >
            <Server className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-emerald-500`} aria-hidden="true" />
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
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            )}
          </Button>
          
          <Button 
            onClick={() => {
              setActiveView('playground')
              if (isSmallScreen) setIsSidebarCollapsed(true)
            }}
            variant={activeView === 'playground' ? 'secondary' : 'ghost'} 
            className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'} focus-visible:ring-2 focus-visible:ring-indigo-500`}
            title="Routing Playground"
            aria-label="Routing Playground"
            aria-current={activeView === 'playground' ? 'page' : undefined}
          >
            <PlayCircle className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-rose-500`} aria-hidden="true" />
            {!isSidebarCollapsed && <span>Routing Playground</span>}
          </Button>
        </nav>
      </div>


    </aside>
  )
}
