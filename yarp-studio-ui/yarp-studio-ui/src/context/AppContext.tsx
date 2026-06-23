import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import type { 
  RouteConfig, 
  ClusterConfig, 
  ClusterStatus, 
  DestinationConfig 
} from '../types/yarp'

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // View Navigation
  activeView: 'overview' | 'routes' | 'clusters' | 'playground';
  setActiveView: (view: 'overview' | 'routes' | 'clusters' | 'playground') => void;
  activeTab: 'visual' | 'json';
  setActiveTab: (tab: 'visual' | 'json') => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isRightPanelCollapsed: boolean;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  isSmallScreen: boolean;

  // Configuration State
  routes: RouteConfig[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteConfig[]>>;
  clusters: ClusterConfig[];
  setClusters: React.Dispatch<React.SetStateAction<ClusterConfig[]>>;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  notification: { type: 'success' | 'error'; message: string } | null;
  showNotification: (type: 'success' | 'error', message: string) => void;
  dismissNotification: () => void;

  // Search/Filters
  routeSearchQuery: string;
  setRouteSearchQuery: (query: string) => void;
  filteredRoutes: RouteConfig[];

  clusterSearchQuery: string;
  setClusterSearchQuery: (query: string) => void;
  filteredClusters: ClusterConfig[];

  overviewSearchQuery: string;
  setOverviewSearchQuery: (query: string) => void;
  filteredOverviewRoutes: RouteConfig[];
  filteredOverviewClusters: ClusterConfig[];

  // Proxy Status / Health
  proxyStatus: ClusterStatus[];
  isRefreshingStatus: boolean;
  fetchStatus: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  handleSaveConfig: () => Promise<void>;

  // Validation
  validationErrors: string[];

  // Topology Graphics
  hoveredRouteId: string | null;
  setHoveredRouteId: (id: string | null) => void;
  hoveredClusterId: string | null;
  setHoveredClusterId: (id: string | null) => void;
  nodeCoords: Record<string, { x: number; y: number }>;
  setNodeCoords: React.Dispatch<React.SetStateAction<Record<string, { x: number; y: number }>>>;
  expandedClusters: Record<string, boolean>;
  setExpandedClusters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  topologyContainerRef: React.RefObject<HTMLDivElement | null>;
  updateNodeCoords: () => void;

  // Playground
  playMethod: string;
  setPlayMethod: (method: string) => void;
  playPath: string;
  setPlayPath: (path: string) => void;
  playHost: string;
  setPlayHost: (host: string) => void;
  playResult: any;
  setPlayResult: (result: any) => void;
  simulateRouting: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('yarp-studio-theme')
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('yarp-studio-theme', theme)
  }, [theme])

  // Navigation & View states
  const [activeView, setActiveView] = useState<'overview' | 'routes' | 'clusters' | 'playground'>('overview')
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Track viewport size dynamically
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1024
      setIsSmallScreen(isSmall)
      if (isSmall) {
        setIsSidebarCollapsed(true)
        setIsRightPanelCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Core configuration states
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [clusters, setClusters] = useState<ClusterConfig[]>([])
  const [originalConfig, setOriginalConfig] = useState<{ routes: RouteConfig[]; clusters: ClusterConfig[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = useMemo(() => {
    if (!originalConfig) return false
    
    // Clean current state (strip _localId)
    const cleanCurrentRoutes = routes.map(({ _localId, ...r }) => r)
    const cleanCurrentClusters = clusters.map(({ _localId, ...c }) => c)

    // Clean original state (strip _localId)
    const cleanOriginalRoutes = originalConfig.routes.map(({ _localId, ...r }) => r)
    const cleanOriginalClusters = originalConfig.clusters.map(({ _localId, ...c }) => c)

    return JSON.stringify(cleanCurrentRoutes) !== JSON.stringify(cleanOriginalRoutes) ||
           JSON.stringify(cleanCurrentClusters) !== JSON.stringify(cleanOriginalClusters)
  }, [routes, clusters, originalConfig])
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Search states
  const [routeSearchQuery, setRouteSearchQuery] = useState('')
  const [clusterSearchQuery, setClusterSearchQuery] = useState('')
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('')

  // Live proxy destination health states
  const [proxyStatus, setProxyStatus] = useState<ClusterStatus[]>([])
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)

  // Topology Mapping Layout States
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null)
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [nodeCoords, setNodeCoords] = useState<Record<string, { x: number; y: number }>>({})
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({})
  const topologyContainerRef = useRef<HTMLDivElement>(null)

  // Playground states
  const [playMethod, setPlayMethod] = useState('GET')
  const [playPath, setPlayPath] = useState('/api/v1/service')
  const [playHost, setPlayHost] = useState('localhost')
  const [playResult, setPlayResult] = useState<any>(null)

  // Toast notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 7000)
  }

  const dismissNotification = () => setNotification(null)

  // Fetch status and config on mount
  useEffect(() => {
    fetchConfig()
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setIsRefreshingStatus(true)
    try {
      const response = await fetch('/yarp-designer/api/status')
      if (response.ok) {
        const data = await response.json()
        setProxyStatus(data)
      }
    } catch (err) {
      console.error('Failed to load proxy status:', err)
    } finally {
      setIsRefreshingStatus(false)
    }
  }

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/yarp-designer/api/config')
      if (response.ok) {
        const data = await response.json()
        
        // Normalize backend route & cluster structures to guarantee safe mapping
        const fetchedRoutes = (data.routes || []).map((r: any) => ({
          ...r,
          _localId: Math.random().toString(36).slice(2, 9),
          routeId: r.routeId || r.RouteId || '',
          match: {
            ...r.match,
            path: r.match?.path || r.Match?.Path || '',
            hosts: r.match?.hosts || r.Match?.Hosts || [],
            methods: r.match?.methods || r.Match?.Methods || []
          },
          clusterId: r.clusterId || r.ClusterId || '',
          order: r.order || r.Order,
          authorizationPolicy: r.authorizationPolicy || r.AuthorizationPolicy || '',
          corsPolicy: r.corsPolicy || r.CorsPolicy || '',
          transforms: r.transforms || r.Transforms || []
        }))

        const fetchedClusters = (data.clusters || []).map((c: any) => {
          const rawDests = c.destinations || c.Destinations || {}
          const destinations: Record<string, DestinationConfig> = {}
          Object.keys(rawDests).forEach(key => {
            destinations[key] = {
              ...rawDests[key],
              address: rawDests[key].address || rawDests[key].Address || ''
            }
          })

          const activeHc = c.healthCheck?.active || c.HealthCheck?.Active || {}
          return {
            ...c,
            _localId: Math.random().toString(36).slice(2, 9),
            clusterId: c.clusterId || c.ClusterId || '',
            loadBalancingPolicy: c.loadBalancingPolicy || c.LoadBalancingPolicy || 'RoundRobin',
            healthCheck: {
              ...c.healthCheck,
              active: {
                ...activeHc,
                enabled: activeHc.enabled || activeHc.Enabled || false,
                interval: activeHc.interval || activeHc.Interval || '00:00:10',
                path: activeHc.path || activeHc.Path || '/health',
                policy: activeHc.policy || activeHc.Policy || 'ConsecutiveFailures',
                timeout: activeHc.timeout || activeHc.Timeout || '00:00:10'
              }
            },
            destinations
          }
        })

        setRoutes(fetchedRoutes)
        setClusters(fetchedClusters)
        setOriginalConfig({ routes: fetchedRoutes, clusters: fetchedClusters })
      } else {
        showNotification('error', 'Failed to retrieve configuration from backend.')
      }
    } catch (err) {
      console.error(err)
      showNotification('error', 'Connection error while loading configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    if (validationErrors.length > 0) {
      showNotification('error', 'Please resolve validation errors before saving.')
      return
    }

    setIsSaving(true)

    // Strip local variables before saving to match backend schemas
    const cleanedRoutes = routes.map(({ _localId, ...r }) => r)
    const cleanedClusters = clusters.map(({ _localId, ...c }) => c)

    try {
      const response = await fetch('/yarp-designer/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Routes: cleanedRoutes,
          Clusters: cleanedClusters
        })
      })

      if (response.ok) {
        const result = await response.json()
        showNotification('success', result.message || 'Config applied and hot-reloaded successfully!')
        fetchConfig()
        fetchStatus()
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.errors && Array.isArray(errorData.errors)) {
          showNotification('error', `Save failed: ${errorData.errors.join('; ')}`)
        } else {
          showNotification('error', errorData.message || 'Failed to save configuration.')
        }
      }
    } catch (err) {
      console.error(err)
      showNotification('error', 'Network error while attempting to save configuration.')
    } finally {
      setIsSaving(false)
    }
  }

  // Derived Search States
  const filteredRoutes = useMemo(() => {
    if (!routeSearchQuery.trim()) return routes
    const query = routeSearchQuery.toLowerCase()
    return routes.filter((r) => {
      const routeIdMatch = (r.routeId || '').toLowerCase().includes(query)
      const pathMatch = (r.match?.path || '').toLowerCase().includes(query)
      const clusterIdMatch = (r.clusterId || '').toLowerCase().includes(query)
      const methodsMatch = (r.match?.methods || []).some(m => m.toLowerCase().includes(query))
      const transformsMatch = (r.transforms || []).some(t => {
        const keys = Object.keys(t)
        return keys.some(k => k.toLowerCase().includes(query))
      })
      return routeIdMatch || pathMatch || clusterIdMatch || methodsMatch || transformsMatch
    })
  }, [routes, routeSearchQuery])

  const filteredClusters = useMemo(() => {
    if (!clusterSearchQuery.trim()) return clusters
    const query = clusterSearchQuery.toLowerCase()
    return clusters.filter((c) => {
      const clusterIdMatch = (c.clusterId || '').toLowerCase().includes(query)
      const policyMatch = (c.loadBalancingPolicy || '').toLowerCase().includes(query)
      const activeHealthPathMatch = (c.healthCheck?.active?.path || '').toLowerCase().includes(query)
      const destinationsMatch = Object.entries(c.destinations || {}).some(
        ([key, val]) =>
          key.toLowerCase().includes(query) ||
          (val?.address || '').toLowerCase().includes(query)
      )
      return clusterIdMatch || policyMatch || activeHealthPathMatch || destinationsMatch
    })
  }, [clusters, clusterSearchQuery])

  const filteredOverviewRoutes = useMemo(() => {
    if (!overviewSearchQuery.trim()) return routes
    const query = overviewSearchQuery.toLowerCase()
    return routes.filter((r) => {
      const routeIdMatch = (r.routeId || '').toLowerCase().includes(query)
      const pathMatch = (r.match?.path || '').toLowerCase().includes(query)
      const clusterIdMatch = (r.clusterId || '').toLowerCase().includes(query)
      const methodsMatch = (r.match?.methods || []).some(m => m.toLowerCase().includes(query))
      const transformsMatch = (r.transforms || []).some(t => {
        const keys = Object.keys(t)
        return keys.some(k => k.toLowerCase().includes(query))
      })
      return routeIdMatch || pathMatch || clusterIdMatch || methodsMatch || transformsMatch
    })
  }, [routes, overviewSearchQuery])

  const filteredOverviewClusters = useMemo(() => {
    const targetedClusterIds = new Set(filteredOverviewRoutes.map(r => r.clusterId).filter(Boolean))
    if (!overviewSearchQuery.trim()) return clusters
    const query = overviewSearchQuery.toLowerCase()
    return clusters.filter((c) => {
      if (targetedClusterIds.has(c.clusterId)) return true
      const clusterIdMatch = (c.clusterId || '').toLowerCase().includes(query)
      const policyMatch = (c.loadBalancingPolicy || '').toLowerCase().includes(query)
      const activeHealthPathMatch = (c.healthCheck?.active?.path || '').toLowerCase().includes(query)
      const destinationsMatch = Object.entries(c.destinations || {}).some(
        ([key, val]) =>
          key.toLowerCase().includes(query) ||
          (val?.address || '').toLowerCase().includes(query)
      )
      return clusterIdMatch || policyMatch || activeHealthPathMatch || destinationsMatch
    })
  }, [clusters, filteredOverviewRoutes, overviewSearchQuery])

  // Reactive Validation Logic
  const validationErrors = useMemo(() => {
    const errors: string[] = []

    // 1. Validate Routes
    routes.forEach(route => {
      if (!route.routeId || route.routeId.trim() === '') {
        errors.push('All routes must specify a unique Route ID.')
      }
      if (!route.match.path || route.match.path.trim() === '') {
        errors.push(`Route [${route.routeId || 'Unnamed'}] is missing a path match pattern.`)
      }
      if (route.clusterId) {
        const clusterExists = clusters.some(c => c.clusterId === route.clusterId)
        if (!clusterExists) {
          errors.push(`Route [${route.routeId}] targets a non-existent cluster [${route.clusterId}].`)
        }
      } else {
        errors.push(`Route [${route.routeId}] does not specify any target cluster.`)
      }
    })

    // 2. Validate Clusters
    clusters.forEach(cluster => {
      if (!cluster.clusterId || cluster.clusterId.trim() === '') {
        errors.push('All clusters must specify a unique Cluster ID.')
      }
      const destKeys = Object.keys(cluster.destinations || {})
      if (destKeys.length === 0) {
        errors.push(`Cluster [${cluster.clusterId || 'Unnamed'}] must have at least one destination instance.`)
      }
      destKeys.forEach(key => {
        const addr = cluster.destinations?.[key]?.address || ''
        if (!addr || addr.trim() === '') {
          errors.push(`Cluster [${cluster.clusterId}] has an empty destination address for instance [${key}].`)
        } else {
          try {
            if (!addr.startsWith('http://') && !addr.startsWith('https://')) {
              errors.push(`Cluster [${cluster.clusterId}] destination [${key}] URL must start with http:// or https:// (got: "${addr}").`)
            }
          } catch {
            errors.push(`Cluster [${cluster.clusterId}] destination [${key}] has an invalid URL pattern.`)
          }
        }
      })
    })

    // 3. Check for duplicates
    const routeIds = routes.map(r => r.routeId)
    const duplicateRouteIds = routeIds.filter((item, index) => routeIds.indexOf(item) !== index)
    if (duplicateRouteIds.length > 0) {
      errors.push(`Duplicate Route IDs detected: ${duplicateRouteIds.join(', ')}`)
    }

    const clusterIds = clusters.map(c => c.clusterId)
    const duplicateClusterIds = clusterIds.filter((item, index) => clusterIds.indexOf(item) !== index)
    if (duplicateClusterIds.length > 0) {
      errors.push(`Duplicate Cluster IDs detected: ${duplicateClusterIds.join(', ')}`)
    }

    return errors
  }, [routes, clusters])

  // Measure node coordinates for SVG drawing
  const updateNodeCoords = () => {
    if (!topologyContainerRef.current) return
    const containerRect = topologyContainerRef.current.getBoundingClientRect()
    const coords: Record<string, { x: number; y: number }> = {}

    // Measure routes
    routes.forEach((r) => {
      const el = document.getElementById(`route-port-${r.routeId}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        coords[`route-${r.routeId}`] = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        }
      }
    })

    // Measure Gateway Hub ports
    const gwInEl = document.getElementById('gw-port-in')
    if (gwInEl) {
      const rect = gwInEl.getBoundingClientRect()
      coords['gw-in'] = {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      }
    }

    const gwOutEl = document.getElementById('gw-port-out')
    if (gwOutEl) {
      const rect = gwOutEl.getBoundingClientRect()
      coords['gw-out'] = {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      }
    }

    // Measure Clusters
    clusters.forEach((c) => {
      const el = document.getElementById(`cluster-port-${c.clusterId}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        coords[`cluster-${c.clusterId}`] = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        }
      }
    })

    setNodeCoords(coords)
  }

  // Playground Simulation Logic
  const simulateRouting = () => {
    const matchPath = (template: string, path: string) => {
      if (!template) return false;
      const t = template.trim().replace(/\/+$/, '') || '/';
      const p = path.trim().replace(/\/+$/, '') || '/';
      if (t === p) return true;
      
      let escaped = t.replace(/[.+^${}()|[\]\\]/g, (c) => c === '{' || c === '}' ? c : '\\' + c);
      escaped = escaped.replace(/\/\{(\*\*)[a-zA-Z0-9_-]+\}/g, '(/?.*)');
      escaped = escaped.replace(/\{(\*\*)[a-zA-Z0-9_-]+\}/g, '(.*)');
      escaped = escaped.replace(/\{[a-zA-Z0-9_-]+\}/g, '([^/]+)');
      
      try {
        const regex = new RegExp('^' + escaped + '$', 'i');
        return regex.test(p);
      } catch (e) {
        return false;
      }
    };

    let matchedRoute: RouteConfig | null = null;
    for (const route of routes) {
      const methods = route.match.methods || [];
      if (methods.length > 0 && !methods.includes(playMethod)) {
        continue;
      }

      const hosts = route.match.hosts || [];
      if (hosts.length > 0) {
        const hostMatched = hosts.some(h => {
          if (h.startsWith('*.')) {
            const suffix = h.slice(2).toLowerCase();
            return playHost.toLowerCase().endsWith(suffix);
          }
          return h.toLowerCase() === playHost.toLowerCase();
        });
        if (!hostMatched) continue;
      }

      if (matchPath(route.match.path || '/*', playPath)) {
        matchedRoute = route;
        break;
      }
    }

    if (!matchedRoute) {
      setPlayResult({ matched: false });
      return;
    }

    let transformedPath = playPath;
    const transformTrace: { name: string; from: string; to: string }[] = [];
    const addedHeaders: Record<string, string> = {};

    (matchedRoute.transforms || []).forEach(t => {
      if (t.hasOwnProperty('PathRemovePrefix')) {
        const prefix = t.PathRemovePrefix;
        if (transformedPath.startsWith(prefix)) {
          const original = transformedPath;
          transformedPath = transformedPath.slice(prefix.length) || '/';
          transformTrace.push({ name: 'PathRemovePrefix', from: original, to: transformedPath });
        }
      } else if (t.hasOwnProperty('PathPrefix')) {
        const prefix = t.PathPrefix;
        const original = transformedPath;
        transformedPath = prefix + (transformedPath.startsWith('/') ? transformedPath : '/' + transformedPath);
        transformTrace.push({ name: 'PathPrefix', from: original, to: transformedPath });
      } else if (t.hasOwnProperty('PathSet')) {
        const pathVal = t.PathSet;
        const original = transformedPath;
        transformedPath = pathVal;
        transformTrace.push({ name: 'PathSet', from: original, to: transformedPath });
      } else if (t.hasOwnProperty('RequestHeader')) {
        const headerName = t.RequestHeader;
        const headerVal = t.Set || '';
        addedHeaders[headerName] = headerVal;
      }
    });

    const matchedCluster = clusters.find(c => c.clusterId === matchedRoute!.clusterId);
    const liveClusterStatus = proxyStatus.find(s => s.clusterId === matchedRoute!.clusterId);

    setPlayResult({
      matched: true,
      route: matchedRoute,
      transformedPath,
      transformTrace,
      addedHeaders,
      cluster: matchedCluster,
      liveStatus: liveClusterStatus
    });
  };

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      activeView,
      setActiveView,
      activeTab,
      setActiveTab,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isRightPanelCollapsed,
      setIsRightPanelCollapsed,
      isSmallScreen,
      routes,
      setRoutes,
      clusters,
      setClusters,
      isLoading,
      isSaving,
      hasChanges,
      notification,
      showNotification,
      dismissNotification,
      routeSearchQuery,
      setRouteSearchQuery,
      filteredRoutes,
      clusterSearchQuery,
      setClusterSearchQuery,
      filteredClusters,
      overviewSearchQuery,
      setOverviewSearchQuery,
      filteredOverviewRoutes,
      filteredOverviewClusters,
      proxyStatus,
      isRefreshingStatus,
      fetchStatus,
      fetchConfig,
      handleSaveConfig,
      validationErrors,
      hoveredRouteId,
      setHoveredRouteId,
      hoveredClusterId,
      setHoveredClusterId,
      nodeCoords,
      setNodeCoords,
      expandedClusters,
      setExpandedClusters,
      topologyContainerRef,
      updateNodeCoords,
      playMethod,
      setPlayMethod,
      playPath,
      setPlayPath,
      playHost,
      setPlayHost,
      playResult,
      setPlayResult,
      simulateRouting
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
