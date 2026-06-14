import React from 'react'
import { 
  PanelRightOpen, 
  PanelRightClose, 
  FileJson, 
  AlertTriangle, 
  Check, 
  Shield 
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { useApp } from '../../context/AppContext'

export const RightPanel: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    routes,
    clusters,
    validationErrors,
    isSmallScreen
  } = useApp()

  const panelClasses = isSmallScreen
    ? `${isRightPanelCollapsed ? 'w-0 overflow-hidden p-0 border-l-0' : 'w-full max-w-[400px] fixed inset-y-14 right-0 z-50 h-[calc(100vh-3.5rem)] shadow-xl p-0'} border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden transition-all duration-300`
    : `${isRightPanelCollapsed ? 'w-16 p-2' : 'w-[450px] p-0'} border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden shrink-0 transition-all duration-300`

  return (
    <div 
      className={panelClasses}
      role="complementary"
      aria-label="Configuration Details Panel"
      aria-hidden={isSmallScreen && isRightPanelCollapsed}
    >
      {isRightPanelCollapsed ? (
        <div className="flex flex-col items-center space-y-6 pt-2 h-full justify-between pb-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Expand button */}
            {!isSmallScreen && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsRightPanelCollapsed(false)} 
                className="h-8 w-8 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Expand Panel"
                aria-label="Expand configuration details panel"
              >
                <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}

            {/* Icon Indicators */}
            <div className="flex flex-col items-center space-y-4">
              <div title="Config Footprint" aria-hidden="true">
                <FileJson className="h-5 w-5 text-indigo-500" />
              </div>
              
              {/* Validation indicator icon */}
              {validationErrors.length > 0 ? (
                <div 
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 cursor-help" 
                  title={`Validation Blockers (${validationErrors.length})`}
                  role="img"
                  aria-label={`${validationErrors.length} validation errors present`}
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>
              ) : (
                <div 
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500" 
                  title="Schema Integrity Intact"
                  role="img"
                  aria-label="Configuration schema integrity is healthy"
                >
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>

          {/* Vertical rotation text */}
          <div className="text-slate-400 dark:text-slate-500 font-semibold tracking-wider text-[11px] uppercase select-none rotate-90 my-8 origin-center whitespace-nowrap" aria-hidden="true">
            Config Footprint
          </div>
        </div>
      ) : (
        <Tabs defaultValue="visual" value={activeTab} onValueChange={(val) => setActiveTab(val as 'visual' | 'json')} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <FileJson className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <span>Config Footprint</span>
            </span>
            <div className="flex items-center space-x-2">
              <TabsList className="h-8" aria-label="Configuration details view type">
                <TabsTrigger value="visual" className="text-xs py-1">Info</TabsTrigger>
                <TabsTrigger value="json" className="text-xs py-1">JSON Preview</TabsTrigger>
              </TabsList>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsRightPanelCollapsed(true)} 
                className="h-8 w-8 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Collapse Panel"
                aria-label="Collapse configuration details panel"
              >
                <PanelRightClose className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Validation & Guide Area */}
          <TabsContent value="visual" className="flex-1 overflow-y-auto p-6 space-y-6 focus:outline-none">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                <span>Real-time Gateway Auditing</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Local YARP schema validation runs on every edit loop to protect Gateway integrity.</p>
            </div>

            <div className="space-y-4">
              {validationErrors.length > 0 ? (
                <Alert variant="destructive">
                  <div className="flex space-x-2.5">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <AlertTitle className="text-red-800 dark:text-red-400 font-bold">Validation Blockers ({validationErrors.length})</AlertTitle>
                      <AlertDescription className="mt-2 text-xs text-red-700 dark:text-red-400/90 space-y-2">
                        <ul className="list-disc pl-4 space-y-1.5" role="list">
                          {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ) : (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-5 flex items-start space-x-3.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Schema Integrity Intact</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 leading-relaxed">
                      All configured routes point to existing cluster keys. Destination addresses are correctly formatted and ready to proxy traffic.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-900 pt-6">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Yarp Hot-reload Cycle</h4>
              <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[10px]">Step 1</Badge>
                  <p>Adjust routes and clusters inside the workspace panels.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[10px]">Step 2</Badge>
                  <p>Review validation status. Blockers turn the "Apply Config" button inactive to prevent proxy failure.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[10px]">Step 3</Badge>
                  <p>Click "Apply Config" to commit changes directly onto LiteDB database and trigger YARP memory swapping.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Code Preview Panel */}
          <TabsContent value="json" className="flex-1 overflow-hidden flex flex-col p-4 focus:outline-none">
            <div className="flex-1 bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto font-mono text-xs shadow-inner select-all relative">
              <span className="absolute top-2 right-2 text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider select-none">READ ONLY</span>
              <pre className="whitespace-pre" tabIndex={0} aria-label="JSON representation of currently configured proxy routes and clusters">
                {JSON.stringify({ Routes: routes, Clusters: clusters }, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
