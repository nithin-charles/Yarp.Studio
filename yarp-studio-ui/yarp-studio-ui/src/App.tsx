import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { RightPanel } from './components/Layout/RightPanel'
import { OverviewTab } from './components/Views/OverviewTab'
import { RouteBuilderTab } from './components/Views/RouteBuilderTab'
import { ClusterManagerTab } from './components/Views/ClusterManagerTab'
import { PlaygroundTab } from './components/Views/PlaygroundTab'

function AppContent() {
  const { activeView } = useApp()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex-col font-sans">
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Central Layout Canvas */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8">
            {activeView === 'overview' && <OverviewTab />}
            {activeView === 'routes' && <RouteBuilderTab />}
            {activeView === 'clusters' && <ClusterManagerTab />}
            {activeView === 'playground' && <PlaygroundTab />}
          </div>

          <RightPanel />
        </main>
      </div>
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
