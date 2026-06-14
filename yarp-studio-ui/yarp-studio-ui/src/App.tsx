import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { RightPanel } from './components/Layout/RightPanel'
import { OverviewTab } from './components/Views/OverviewTab'
import { RouteBuilderTab } from './components/Views/RouteBuilderTab'
import { ClusterManagerTab } from './components/Views/ClusterManagerTab'
import { PlaygroundTab } from './components/Views/PlaygroundTab'
import { Check, AlertTriangle, X } from 'lucide-react'

function AppContent() {
  const { 
    activeView, 
    isSmallScreen, 
    isSidebarCollapsed, 
    isRightPanelCollapsed, 
    setIsSidebarCollapsed, 
    setIsRightPanelCollapsed,
    notification,
    dismissNotification
  } = useApp()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex-col font-sans relative">
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        {/* Central Layout Canvas */}
        <main className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {activeView === 'overview' && <OverviewTab />}
            {activeView === 'routes' && <RouteBuilderTab />}
            {activeView === 'clusters' && <ClusterManagerTab />}
            {activeView === 'playground' && <PlaygroundTab />}
          </div>

          <RightPanel />
        </main>
      </div>

      {/* Mobile/Tablet Drawer Backdrop Overlay */}
      {isSmallScreen && (!isSidebarCollapsed || !isRightPanelCollapsed) && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => {
            setIsSidebarCollapsed(true)
            setIsRightPanelCollapsed(true)
          }}
          aria-hidden="true"
        />
      )}

      {/* Global Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl border shadow-lg max-w-sm w-[calc(100vw-2rem)] sm:w-96 flex items-start space-x-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 border-slate-200/80 dark:border-slate-800/80 animate-in slide-in-from-bottom-2 fade-in duration-300`}
          role="status"
          aria-live="polite"
        >
          <div className="mt-0.5 shrink-0">
            {notification.type === 'success' ? (
              <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" aria-hidden="true" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p className="text-sm font-medium leading-tight">{notification.message}</p>
          </div>
          <button 
            type="button" 
            onClick={dismissNotification}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 rounded p-0.5 transition-colors shrink-0"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
