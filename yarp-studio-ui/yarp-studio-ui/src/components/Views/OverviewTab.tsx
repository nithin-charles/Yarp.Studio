import React, { useEffect } from 'react'
import { 
  Search, 
  X, 
  Network, 
  Globe, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Cpu, 
  Server,
  RefreshCw 
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { useApp } from '../../context/AppContext'

export const OverviewTab: React.FC = () => {
  const {
    routes,
    clusters,
    isLoading,
    isSidebarCollapsed,
    overviewSearchQuery,
    setOverviewSearchQuery,
    filteredOverviewRoutes,
    filteredOverviewClusters,
    proxyStatus,
    hoveredRouteId,
    setHoveredRouteId,
    hoveredClusterId,
    setHoveredClusterId,
    nodeCoords,
    expandedClusters,
    setExpandedClusters,
    topologyContainerRef,
    updateNodeCoords,
    setActiveView
  } = useApp()

  // Track topology rendering updates and layout stability
  useEffect(() => {
    // Run measurement
    updateNodeCoords()

    // Add window resize listener
    window.addEventListener('resize', updateNodeCoords)

    // Schedule delayed runs to wait for rendering to stabilize
    const timer1 = setTimeout(updateNodeCoords, 100)
    const timer2 = setTimeout(updateNodeCoords, 500)

    // Observe changes inside the container to adjust on size transitions
    let resizeObserver: ResizeObserver | null = null
    if (topologyContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateNodeCoords()
      })
      resizeObserver.observe(topologyContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateNodeCoords)
      clearTimeout(timer1)
      clearTimeout(timer2)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [routes, clusters, isSidebarCollapsed, overviewSearchQuery, updateNodeCoords, topologyContainerRef])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Topology Mapping</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize traffic routing flows from public paths to destination servers.</p>
        </div>
        <div className="relative max-w-xs w-full group self-start sm:self-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500" />
          <Input
            type="text"
            placeholder="Search routes & clusters..."
            value={overviewSearchQuery}
            onChange={(e) => {
              setOverviewSearchQuery(e.target.value)
              setTimeout(updateNodeCoords, 50)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOverviewSearchQuery('')
                setTimeout(updateNodeCoords, 50)
              }
            }}
            className="h-9 text-xs pl-9 pr-8 w-full bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 transition-all duration-200"
          />
          {overviewSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setOverviewSearchQuery('')
                setTimeout(updateNodeCoords, 50)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Clear search (Esc)"
            >
              <X className="h-3 w-3 transition-transform duration-200 hover:rotate-90" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes topology-flow {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .flow-line {
          animation: topology-flow 1.2s linear infinite;
        }
      `}</style>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading active topology configurations...</p>
        </div>
      ) : routes.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
          <Network className="h-12 w-12 text-slate-300 mb-4" />
          <CardTitle className="mb-2">No Routes Configured</CardTitle>
          <CardDescription className="max-w-md mb-6">
            Define incoming HTTP matching patterns and tie them to backend cluster targets to visualize your proxy topology.
          </CardDescription>
          <Button onClick={() => setActiveView('routes')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Create a Route
          </Button>
        </Card>
      ) : (
        <div 
          ref={topologyContainerRef as React.RefObject<HTMLDivElement>}
          className="relative grid grid-cols-1 xl:grid-cols-3 gap-12 items-stretch min-h-[600px] bg-slate-50/30 dark:bg-slate-950/10 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-visible"
        >
          {/* SVG overlay to draw connections between elements */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
            <defs>
              <linearGradient id="active-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            
            {/* Routes to Gateway Hub */}
            {filteredOverviewRoutes.map((r) => {
              const routeKey = `route-${r.routeId}`
              const routePt = nodeCoords[routeKey]
              const gwInPt = nodeCoords['gw-in']
              
              if (!routePt || !gwInPt) return null
              
              const isHovered = hoveredRouteId === r.routeId
              const isAnyRouteHovered = hoveredRouteId !== null
              
              const isPathActive = isHovered
              const opacity = isAnyRouteHovered ? (isHovered ? 1 : 0.15) : 0.4
              const strokeColor = isPathActive ? "url(#active-grad)" : "currentColor"
              const strokeWidth = isPathActive ? 3.5 : 1.5
              
              const cp1X = routePt.x + 40
              const cp2X = gwInPt.x - 40
              
              return (
                <g key={`route-line-${r.routeId}`}>
                  <path
                    d={`M ${routePt.x} ${routePt.y} C ${cp1X} ${routePt.y}, ${cp2X} ${gwInPt.y}, ${gwInPt.x} ${gwInPt.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    className={`transition-all duration-300 ${isPathActive ? 'text-indigo-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-300 dark:text-slate-850'}`}
                  />
                  {isPathActive && (
                    <path
                      d={`M ${routePt.x} ${routePt.y} C ${cp1X} ${routePt.y}, ${cp2X} ${gwInPt.y}, ${gwInPt.x} ${gwInPt.y}`}
                      fill="none"
                      stroke="url(#active-grad)"
                      strokeWidth={strokeWidth}
                      opacity={0.8}
                      strokeDasharray="8 8"
                      className="flow-line"
                    />
                  )}
                </g>
              )
            })}

            {/* Gateway Hub to Clusters */}
            {filteredOverviewClusters.map((c) => {
              const clusterKey = `cluster-${c.clusterId}`
              const clusterPt = nodeCoords[clusterKey]
              const gwOutPt = nodeCoords['gw-out']
              
              if (!clusterPt || !gwOutPt) return null
              
              const activeRoutesForCluster = filteredOverviewRoutes.filter((r) => r.clusterId === c.clusterId)
              const isClusterActive = hoveredRouteId 
                ? activeRoutesForCluster.some((r) => r.routeId === hoveredRouteId) 
                : hoveredClusterId === c.clusterId
                
              const isAnyRouteHovered = hoveredRouteId !== null || hoveredClusterId !== null
              const opacity = isAnyRouteHovered ? (isClusterActive ? 1 : 0.15) : 0.4
              const strokeColor = isClusterActive ? "#10b981" : "currentColor"
              const strokeWidth = isClusterActive ? 3.5 : 1.5
              
              const cp1X = gwOutPt.x + 40
              const cp2X = clusterPt.x - 40
              
              return (
                <g key={`cluster-line-${c.clusterId}`}>
                  <path
                    d={`M ${gwOutPt.x} ${gwOutPt.y} C ${cp1X} ${gwOutPt.y}, ${cp2X} ${clusterPt.y}, ${clusterPt.x} ${clusterPt.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    className={`transition-all duration-300 ${isClusterActive ? 'text-emerald-500 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-300 dark:text-slate-850'}`}
                  />
                  {isClusterActive && (
                    <path
                      d={`M ${gwOutPt.x} ${gwOutPt.y} C ${cp1X} ${gwOutPt.y}, ${cp2X} ${clusterPt.y}, ${clusterPt.x} ${clusterPt.y}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={strokeWidth}
                      opacity={0.8}
                      strokeDasharray="8 8"
                      className="flow-line"
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Column 1: Matchers / Routes (Traffic Entrypoint) */}
          <div className="z-10 flex flex-col space-y-4 w-full max-w-sm mx-auto xl:mx-0">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Matchers / Routes</h2>
                <p className="text-[11px] text-slate-400">Incoming request patterns</p>
              </div>
            </div>
            
            <div 
              className="flex flex-col space-y-3.5 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2"
              onScroll={updateNodeCoords}
            >
              {filteredOverviewRoutes.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  No matching routes.
                </div>
              ) : (
                filteredOverviewRoutes.map((r) => {
                  const isHovered = hoveredRouteId === r.routeId
                  const isDimmed = hoveredRouteId !== null && !isHovered
                
                  return (
                    <Card 
                      key={r.routeId} 
                      id={`route-card-${r.routeId}`}
                      className={`relative border transition-all duration-300 cursor-pointer select-none overflow-visible shadow-sm ${
                        isHovered 
                          ? 'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-slate-900 shadow-md ring-1 ring-indigo-500/25 dark:ring-indigo-400/25' 
                          : isDimmed 
                            ? 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-50'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      onMouseEnter={() => {
                        setHoveredRouteId(r.routeId)
                        setHoveredClusterId(r.clusterId || null)
                      }}
                      onMouseLeave={() => {
                        setHoveredRouteId(null)
                        setHoveredClusterId(null)
                      }}
                    >
                      {/* Output connector port visual */}
                      <div 
                        id={`route-port-${r.routeId}`}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-300 z-10 ${
                          isHovered 
                            ? 'border-indigo-500 bg-indigo-500 shadow-[0_0_6px_#6366f1] scale-125' 
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                        }`}
                      />
                      
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 font-semibold max-w-[150px] truncate">
                            {r.routeId}
                          </Badge>
                          <div className="flex space-x-1 shrink-0">
                            {(r.match.methods && r.match.methods.length > 0 ? r.match.methods : ['ANY']).map((m) => (
                              <Badge 
                                key={m} 
                                variant="secondary"
                                className={`text-[9px] font-bold py-0.5 px-1 ${
                                  m === 'GET' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                                  m === 'POST' ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                                  m === 'PUT' ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                                  m === 'DELETE' ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' :
                                  'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 break-all">
                            {r.match.path || '/*'}
                          </div>
                          {r.match.hosts && r.match.hosts.length > 0 && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                              Host: {r.match.hosts.join(', ')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Column 2: Visual Gateway Proxy Pipeline Hub (The YARP engine) */}
          <div className="z-10 flex flex-col justify-center items-center">
            <div 
              id="gateway-hub"
              className={`w-full max-w-sm rounded-2xl border bg-white dark:bg-slate-900 shadow-lg transition-all duration-500 flex flex-col overflow-hidden relative ${
                hoveredRouteId 
                  ? 'border-indigo-500/50 shadow-indigo-500/10 scale-[1.03] dark:shadow-indigo-500/5' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Port markers */}
              <div 
                id="gw-port-in"
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-all duration-300 z-10"
              />
              <div 
                id="gw-port-out"
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1.5 w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-all duration-300 z-10"
              />

              {/* Header / Engine Core */}
              <div className="p-5 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full transition-all duration-500 ${
                  hoveredRouteId 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110 animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">YARP Reverse Proxy Engine</h3>
                  <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Gateway Pipeline Core</p>
                </div>
              </div>

              {/* Active Route Trace Pipeline */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[400px]">
                {hoveredRouteId ? (
                  (() => {
                    const r = routes.find(route => route.routeId === hoveredRouteId)
                    if (!r) return null
                    
                    const cluster = clusters.find(c => c.clusterId === r.clusterId)
                    const transforms = r.transforms || []
                    
                    return (
                      <div className="space-y-4">
                        <div className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span>Pipeline trace</span>
                          <Badge variant="outline" className="text-[9px] font-mono font-semibold uppercase">{r.routeId}</Badge>
                        </div>

                        {/* Pipeline stages */}
                        <div className="relative pl-6 space-y-5 border-l border-slate-100 dark:border-slate-800 ml-1.5">
                          {/* Stage 1: Auth & Match */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            </span>
                            <div className="text-xs">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">Auth & Policy Checks</div>
                              <div className="text-[10px] text-slate-400 flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-[8px] py-0 px-1 font-semibold">
                                  {r.authorizationPolicy ? `Auth: ${r.authorizationPolicy}` : 'Auth: Anonymous'}
                                </Badge>
                                <Badge variant="outline" className="text-[8px] py-0 px-1 font-semibold">
                                  {r.corsPolicy ? `CORS: ${r.corsPolicy}` : 'CORS: Pass-through'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Stage 2: Transforms */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            </span>
                            <div className="text-xs">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">Request & Path transforms</div>
                              <div className="mt-1">
                                {transforms.length > 0 ? (
                                  <div className="mt-1 space-y-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                    {transforms.map((t, idx) => {
                                      const name = Object.keys(t)[0]
                                      const val = Object.values(t)[0]
                                      return (
                                        <div key={idx} className="flex items-center justify-between">
                                          <span className="font-semibold text-indigo-500">{name}</span>
                                          <span className="truncate max-w-[130px]" title={String(val)}>{String(val)}</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 italic">No transforms config. Pass-through path.</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stage 3: Load balancing */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            </span>
                            <div className="text-xs">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">Load Balancer dispatch</div>
                              <div className="text-[10px] text-slate-400">
                                {cluster ? `Policy: ${cluster.loadBalancingPolicy || 'RoundRobin'}` : 'No target cluster configured'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-center space-y-3 py-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700">
                      <Network className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proxy Active State</h4>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto mt-1">
                        Hover over a Match Rule on the left to see the request execution and transformation pipeline.
                      </p>
                    </div>
                    <div className="pt-4 flex justify-center space-x-3 text-center border-t border-slate-100 dark:border-slate-800 mt-2 text-[10px] text-slate-400">
                      <div>
                        <span className="font-bold text-slate-600 dark:text-slate-300 block text-xs">{routes.length}</span>
                        routes
                      </div>
                      <div className="border-r border-slate-200 dark:border-slate-800" />
                      <div>
                        <span className="font-bold text-slate-600 dark:text-slate-300 block text-xs">{clusters.length}</span>
                        clusters
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer status bar */}
              <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 py-2.5 px-4 text-[10px] flex items-center justify-between text-slate-400">
                <span className="font-mono flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-semibold">Active & Live</span>
                </span>
                <span className="font-mono">LiteDB persisted</span>
              </div>
            </div>
          </div>

          {/* Column 3: Backend Clusters (Service Destinations) */}
          <div className="z-10 flex flex-col space-y-4 w-full max-w-sm mx-auto xl:mx-0">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-500">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Clusters</h2>
                <p className="text-[11px] text-slate-400">Service pools & endpoints</p>
              </div>
            </div>

            <div 
              className="flex flex-col space-y-3.5 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2"
              onScroll={updateNodeCoords}
            >
              {filteredOverviewClusters.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  No matching clusters.
                </div>
              ) : (
                filteredOverviewClusters.map((c) => {
                  const activeRoutesForCluster = filteredOverviewRoutes.filter((r) => r.clusterId === c.clusterId)
                
                  // Highlight cluster if hovered directly OR if a route pointing to it is hovered
                  const isDirectHover = hoveredClusterId === c.clusterId
                  const isRoutePointingHereHovered = hoveredRouteId 
                    ? activeRoutesForCluster.some((r) => r.routeId === hoveredRouteId) 
                    : false
                  const isHighlighted = isDirectHover || isRoutePointingHereHovered
                  const isDimmed = (hoveredRouteId !== null || hoveredClusterId !== null) && !isHighlighted
                  
                  const destsCount = Object.keys(c.destinations || {}).length
                  const statusInfo = proxyStatus.find((s) => s.clusterId === c.clusterId)
                  
                  return (
                    <Card 
                      key={c.clusterId}
                      id={`cluster-node-${c.clusterId}`}
                      className={`relative border transition-all duration-300 shadow-sm overflow-visible ${
                        isHighlighted 
                          ? 'border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-900 shadow-md ring-1 ring-emerald-500/25 dark:ring-emerald-400/25' 
                          : isDimmed 
                            ? 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-50'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      onMouseEnter={() => setHoveredClusterId(c.clusterId)}
                      onMouseLeave={() => setHoveredClusterId(null)}
                    >
                      {/* Input connector port visual */}
                      <div 
                        id={`cluster-port-${c.clusterId}`}
                        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-300 z-10 ${
                          isHighlighted 
                            ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_6px_#10b981] scale-125' 
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                        }`}
                      />
                      
                      {/* Header triggers accordion toggle */}
                      <CardHeader 
                        className="p-4 pb-2.5 cursor-pointer select-none"
                        onClick={() => {
                          setExpandedClusters((prev) => ({
                            ...prev,
                            [c.clusterId]: !prev[c.clusterId]
                          }))
                          setTimeout(updateNodeCoords, 150)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm font-mono text-slate-800 dark:text-slate-200">{c.clusterId}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-semibold py-0.5">
                              {destsCount} {destsCount === 1 ? 'instance' : 'instances'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedClusters((prev) => ({
                                  ...prev,
                                  [c.clusterId]: !prev[c.clusterId]
                                }))
                                setTimeout(updateNodeCoords, 150)
                              }}
                            >
                              {expandedClusters[c.clusterId] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>Policy: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{c.loadBalancingPolicy || 'RoundRobin'}</span></span>
                          {c.healthCheck?.active?.enabled && (
                            <Badge variant="outline" className="text-[9px] text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 flex items-center space-x-1 py-0 px-1.5 shrink-0 scale-95 origin-right">
                              <Activity className="h-2.5 w-2.5 shrink-0" />
                              <span>Probing</span>
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      {/* Accordion Content Panel */}
                      {(expandedClusters[c.clusterId]) && (
                        <CardContent className="px-4 pb-3 pt-0 space-y-2 animate-fadeIn">
                          {statusInfo && statusInfo.destinations && statusInfo.destinations.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900/50 flex flex-col">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Destination endpoints:</span>
                              <div className="flex flex-col space-y-1.5">
                                {statusInfo.destinations.map((d) => (
                                  <div 
                                    key={d.destinationId} 
                                    className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-[10px] font-mono"
                                    title={`${d.address}: Active=${d.healthActive}, Passive=${d.healthPassive}`}
                                  >
                                    <div className="flex items-center space-x-1.5 min-w-0">
                                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                        d.healthActive === 'Healthy' ? 'bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]' :
                                        d.healthActive === 'Unhealthy' ? 'bg-rose-500' :
                                        'bg-slate-400'
                                      }`} />
                                      <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[80px]">{d.destinationId}</span>
                                      <span className="text-[9px] text-slate-400 truncate max-w-[100px]">({d.address})</span>
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase py-0 px-1 rounded-sm border shrink-0 scale-90 ${
                                      d.healthActive === 'Healthy'
                                        ? 'text-emerald-600 bg-emerald-50/50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                                        : 'text-rose-600 bg-rose-50/50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30'
                                    }`}>
                                      {d.healthActive}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {activeRoutesForCluster.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-900/50 text-[10px]">
                              <div className="text-slate-400 font-medium mb-1">Serving paths:</div>
                              <div className="flex flex-wrap gap-1">
                                {activeRoutesForCluster.map((tr) => (
                                  <Badge 
                                    key={tr.routeId} 
                                    variant="outline" 
                                    className={`text-[9px] font-mono py-0.5 px-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-all ${
                                      hoveredRouteId === tr.routeId ? 'border-indigo-400 text-indigo-500 dark:border-indigo-400 font-semibold' : ''
                                    }`}
                                  >
                                    {tr.match.path || '/*'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
