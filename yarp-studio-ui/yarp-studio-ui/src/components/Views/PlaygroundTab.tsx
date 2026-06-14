import React from 'react'
import { AlertTriangle, Check, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Select } from '../ui/select'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useApp } from '../../context/AppContext'

export const PlaygroundTab: React.FC = () => {
  const {
    playMethod,
    setPlayMethod,
    playPath,
    setPlayPath,
    playHost,
    setPlayHost,
    playResult,
    simulateRouting
  } = useApp()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Routing Playground</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Simulate incoming gateway requests and visually trace how YARP matches routes, executes transforms, and selects destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column: Request inputs */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 p-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Simulate Request</CardTitle>
            <CardDescription>Enter test values to run against loaded proxy routes.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-medium">HTTP Method</label>
              <Select 
                value={playMethod} 
                onChange={(e) => setPlayMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="OPTIONS">OPTIONS</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-medium">Request Path</label>
              <Input 
                type="text" 
                value={playPath} 
                onChange={(e) => setPlayPath(e.target.value)}
                placeholder="/api/v1/auth/login" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-medium">Host Header</label>
              <Input 
                type="text" 
                value={playHost} 
                onChange={(e) => setPlayHost(e.target.value)}
                placeholder="localhost" 
              />
            </div>

            <Button 
              onClick={simulateRouting} 
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md shadow-rose-600/10"
            >
              Run Trace
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Trace result */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 p-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Trace Results</CardTitle>
            <CardDescription>Evaluation matching pipeline results.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {!playResult ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Click "Run Trace" to evaluate request parameters.
              </div>
            ) : !playResult.matched ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-5 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-400">404 - Not Matched</h4>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1 leading-relaxed">
                    No route matches the specified criteria. Check path catch-alls, host qualifiers, and allowed HTTP methods.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Match Info */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 flex items-start space-x-3.5">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Successfully Matched</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">
                      Matched Route: <span className="font-bold text-indigo-600 dark:text-indigo-400">{playResult.route.routeId}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Pattern: {playResult.route.match.path || '/*'}
                    </p>
                  </div>
                </div>

                {/* Transform Trace */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Transform Output</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-md p-3.5 space-y-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Original Path:</span> {playPath}
                    </div>
                    {playResult.transformTrace.length > 0 ? (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/80">
                        {playResult.transformTrace.map((t: any, i: number) => (
                          <div key={i} className="flex items-center space-x-1.5">
                            <Badge variant="outline" className="text-[10px] scale-90">{t.name}</Badge>
                            <span>{t.from}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{t.to}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
                        No path transformations applied.
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Forwarded Path:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{playResult.transformedPath}</span>
                    </div>
                    {Object.keys(playResult.addedHeaders).length > 0 && (
                      <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/80 space-y-1">
                        <span className="text-slate-400">Injected Headers:</span>
                        {Object.entries(playResult.addedHeaders).map(([k, v]: any) => (
                          <div key={k} className="text-[11px]">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{k}</span>: {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Cluster and Health */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Cluster Dispatch</h4>
                  {playResult.cluster ? (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-md p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400">Cluster:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{playResult.cluster.clusterId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">LB Policy:</span> {playResult.cluster.loadBalancingPolicy}
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-850/80">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Destination endpoints:</span>
                        {Object.entries(playResult.cluster.destinations || {}).map(([key, val]: any) => {
                          const liveDest = playResult.liveStatus?.destinations?.find((d: any) => d.destinationId === key);
                          const healthStr = liveDest ? liveDest.healthActive : 'Unknown';
                          const isHealthy = liveDest ? liveDest.isHealthy : true;
                          return (
                            <div key={key} className="flex items-center justify-between bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded border border-slate-200/50 dark:border-slate-800/50 text-xs font-mono">
                              <div className="flex items-center space-x-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  healthStr === 'Healthy' ? 'bg-emerald-500' :
                                  healthStr === 'Unhealthy' ? 'bg-red-500' :
                                  'bg-slate-400'
                                }`} />
                                <span className="font-bold text-slate-700 dark:text-slate-300">{key}</span>
                                <span className="text-[10px] text-slate-400">({val.address})</span>
                              </div>
                              <Badge variant={isHealthy ? 'success' : 'destructive'} className="text-[9px] py-0 font-medium">
                                {healthStr}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/10 p-3 rounded border border-red-200/50 font-mono">
                      Route targets cluster "{playResult.route.clusterId}" but it is not configured in Cluster Manager!
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
