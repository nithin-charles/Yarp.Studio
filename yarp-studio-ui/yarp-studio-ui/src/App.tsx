import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Network, 
  Server, 
  Layers, 
  Plus, 
  Trash, 
  Save, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Activity,
  FileJson,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  PlayCircle,
  Globe,
  Cpu,
  ChevronDown,
  ChevronUp,
  X,
  Search
} from 'lucide-react'

// Import custom UI components
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table'
import { Select } from './components/ui/select'
import { Switch } from './components/ui/switch'
import { Input } from './components/ui/input'
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'

// Define configuration interfaces
interface RouteMatch {
  path?: string;
  hosts?: string[];
  methods?: string[];
  headers?: any[];
  queryParameters?: any[];
}

interface RouteConfig {
  _localId?: string;
  routeId: string;
  match: RouteMatch;
  clusterId?: string;
  order?: number;
  authorizationPolicy?: string;
  corsPolicy?: string;
  transforms?: Record<string, string>[];
  [key: string]: any;
}

interface DestinationConfig {
  address: string;
  [key: string]: any;
}

interface ClusterConfig {
  _localId?: string;
  clusterId: string;
  loadBalancingPolicy?: string;
  healthCheck?: HealthCheckConfig;
  destinations?: Record<string, DestinationConfig>;
  [key: string]: any;
}

interface ActiveHealthCheck {
  enabled?: boolean;
  interval?: string; // e.g. "00:00:10"
  timeout?: string;
  policy?: string;
  path?: string;
}

interface HealthCheckConfig {
  active?: ActiveHealthCheck;
}

interface DestinationConfig {
  address: string;
}

interface ClusterConfig {
  clusterId: string;
  loadBalancingPolicy?: string;
  healthCheck?: HealthCheckConfig;
  destinations?: Record<string, DestinationConfig>;
}

export default function App() {
  // Theme state (Dark Mode / Light Mode)
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
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  // Core configuration states
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [clusters, setClusters] = useState<ClusterConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Search state for Routes list
  const [routeSearchQuery, setRouteSearchQuery] = useState('')

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

  // Search state for Clusters list
  const [clusterSearchQuery, setClusterSearchQuery] = useState('')

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

  // Search state for Overview Map
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('')

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

  // Editing state trackers
  const [editingRouteLocalId, setEditingRouteLocalId] = useState<string | null>(null)
  const [editingClusterLocalId, setEditingClusterLocalId] = useState<string | null>(null)

  // Form states for Routes
  const [routeForm, setRouteForm] = useState<Partial<RouteConfig>>({
    routeId: '',
    match: { path: '', methods: [], hosts: [] },
    clusterId: '',
    transforms: []
  })

  // Form states for Clusters
  const [clusterForm, setClusterForm] = useState<Partial<ClusterConfig>>({
    clusterId: '',
    loadBalancingPolicy: 'RoundRobin',
    healthCheck: { active: { enabled: false, interval: '00:00:10', path: '/health' } },
    destinations: {}
  })
  
  // Destination helper array to hold key-value pairs while editing
  const [destinationInputs, setDestinationInputs] = useState<{ id: string, name: string, address: string }[]>([])

  // Live proxy destination health states
  interface DestinationStatus {
    destinationId: string;
    address: string;
    healthActive: string;
    healthPassive: string;
    isHealthy: boolean;
  }
  interface ClusterStatus {
    clusterId: string;
    destinations: DestinationStatus[];
  }
  const [proxyStatus, setProxyStatus] = useState<ClusterStatus[]>([])
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)

  // Topology Mapping Layout States
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null)
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [nodeCoords, setNodeCoords] = useState<Record<string, { x: number; y: number }>>({})
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({})
  const topologyContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (activeView !== 'overview') return

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
  }, [activeView, routes, clusters, isSidebarCollapsed, overviewSearchQuery])

  // Playground simulation state
  const [playMethod, setPlayMethod] = useState('GET')
  const [playPath, setPlayPath] = useState('/api/v1/service')
  const [playHost, setPlayHost] = useState('localhost')
  const [playResult, setPlayResult] = useState<any>(null)

  // Fetch config and health status on mount
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
        // Reload settings from disk to ensure sync
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 7000)
  }

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
            // Basic validation to check URL format
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

  const simulateRouting = () => {
    // 1. Path match helper
    const matchPath = (template: string, path: string) => {
      if (!template) return false;
      const t = template.trim().replace(/\/+$/, '') || '/';
      const p = path.trim().replace(/\/+$/, '') || '/';
      if (t === p) return true;
      
      // Convert e.g., /api/{id}/{**catchall}
      let escaped = t.replace(/[.+^${}()|[\]\\]/g, (c) => c === '{' || c === '}' ? c : '\\' + c);
      // Handle the slash before catch-all parameter as optional: e.g. /{**catchall} -> (/?.*)
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

    // 2. Find matching route
    let matchedRoute: RouteConfig | null = null;
    for (const route of routes) {
      // Check method match
      const methods = route.match.methods || [];
      if (methods.length > 0 && !methods.includes(playMethod)) {
        continue;
      }

      // Check host match
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

      // Check path match
      if (matchPath(route.match.path || '/*', playPath)) {
        matchedRoute = route;
        break;
      }
    }

    if (!matchedRoute) {
      setPlayResult({ matched: false });
      return;
    }

    // 3. Apply path transforms
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

    // 4. Find cluster and destinations
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

  // --- Route Handlers ---
  const handleAddRoute = () => {
    const tempId = `route-${Date.now().toString().slice(-4)}`
    const newRoute: RouteConfig = {
      _localId: Math.random().toString(36).slice(2, 9),
      routeId: tempId,
      match: { path: '/api/v1/service', methods: ['GET'], hosts: [] },
      clusterId: clusters[0]?.clusterId || '',
      transforms: [],
      authorizationPolicy: '',
      corsPolicy: ''
    }
    handleEditRoute(newRoute)
  }

  const handleEditRoute = (route: RouteConfig) => {
    setEditingRouteLocalId(route._localId || null)
    setRouteForm({ ...route })
  }

  const handleSaveRouteForm = () => {
    if (!routeForm.routeId || routeForm.routeId.trim() === '') return

    const exists = routes.some(r => r._localId === editingRouteLocalId)
    if (exists) {
      const updatedRoutes = routes.map(r => r._localId === editingRouteLocalId ? (routeForm as RouteConfig) : r)
      setRoutes(updatedRoutes)
    } else {
      setRoutes([...routes, routeForm as RouteConfig])
    }
    setEditingRouteLocalId(null)
  }

  const handleDeleteRoute = (localId: string) => {
    setRoutes(routes.filter(r => r._localId !== localId))
    if (editingRouteLocalId === localId) {
      setEditingRouteLocalId(null)
    }
  }

  const handleAddMethodToRoute = (method: string) => {
    const currentMethods = routeForm.match?.methods || []
    if (currentMethods.includes(method)) {
      setRouteForm({
        ...routeForm,
        match: {
          ...routeForm.match,
          methods: currentMethods.filter(m => m !== method)
        }
      })
    } else {
      setRouteForm({
        ...routeForm,
        match: {
          ...routeForm.match,
          methods: [...currentMethods, method]
        }
      })
    }
  }

  // --- Route Transforms Pipeline Helpers ---
  const handleAddTransform = (type: string) => {
    const currentTransforms = routeForm.transforms || []
    let newTransform: Record<string, string> = {}
    
    if (type === 'PathRemovePrefix') {
      newTransform = { 'PathRemovePrefix': '/api' }
    } else if (type === 'PathPrefix') {
      newTransform = { 'PathPrefix': '/v1' }
    } else if (type === 'PathSet') {
      newTransform = { 'PathSet': '/new-path' }
    } else if (type === 'RequestHeaderAdd') {
      newTransform = { 'RequestHeader': 'X-Custom-Header', 'Set': 'CustomValue' }
    } else if (type === 'ResponseHeader') {
      newTransform = { 'ResponseHeader': 'X-Custom-Response', 'Set': 'Value', 'When': 'Always' }
    } else if (type === 'QueryParameter') {
      newTransform = { 'QueryParameter': 'debug', 'Set': 'true' }
    } else if (type === 'X-Forwarded-Host') {
      newTransform = { 'X-Forwarded': 'Set', 'Prefix': 'true' }
    } else if (type === 'Custom') {
      newTransform = { 'CustomKey': 'CustomValue' }
    }

    setRouteForm({
      ...routeForm,
      transforms: [...currentTransforms, newTransform]
    })
  }

  const handleUpdateTransformValue = (index: number, key: string, val: string) => {
    const currentTransforms = [...(routeForm.transforms || [])]
    const currentItem = { ...currentTransforms[index] }
    
    currentItem[key] = val
    currentTransforms[index] = currentItem
    
    setRouteForm({
      ...routeForm,
      transforms: currentTransforms
    })
  }

  const handleRemoveTransform = (index: number) => {
    const currentTransforms = routeForm.transforms || []
    setRouteForm({
      ...routeForm,
      transforms: currentTransforms.filter((_, idx) => idx !== index)
    })
  }

  // --- Cluster Handlers ---
  const handleAddCluster = () => {
    const tempId = `cluster-${Date.now().toString().slice(-4)}`
    const newCluster: ClusterConfig = {
      _localId: Math.random().toString(36).slice(2, 9),
      clusterId: tempId,
      loadBalancingPolicy: 'RoundRobin',
      healthCheck: { active: { enabled: false, interval: '00:00:10', path: '/health' } },
      destinations: {
        'dest-1': { address: 'http://localhost:5001' }
      }
    }
    handleEditCluster(newCluster)
  }

  const handleEditCluster = (cluster: ClusterConfig) => {
    setEditingClusterLocalId(cluster._localId || null)
    setClusterForm({ ...cluster })
    
    // Map destinations dictionary to standard array list for simple binding
    const destList = Object.entries(cluster.destinations || {}).map(([key, val]) => ({
      id: Math.random().toString(36).slice(2, 9),
      name: key,
      address: val.address
    }))
    setDestinationInputs(destList)
  }

  const handleSaveClusterForm = () => {
    if (!clusterForm.clusterId || clusterForm.clusterId.trim() === '') return

    // Recompile destinations from the active array state
    const compiledDests: Record<string, DestinationConfig> = {}
    destinationInputs.forEach(d => {
      const uniqueName = d.name.trim() !== '' ? d.name.trim() : `dest-${Math.random().toString(36).slice(2, 6)}`
      compiledDests[uniqueName] = { address: d.address }
    })

    const updatedCluster: ClusterConfig = {
      ...clusterForm,
      destinations: compiledDests
    } as ClusterConfig

    const targetCluster = clusters.find(c => c._localId === editingClusterLocalId)
    const oldClusterId = targetCluster?.clusterId;

    const exists = clusters.some(c => c._localId === editingClusterLocalId)
    if (exists) {
      const updatedClusters = clusters.map(c => c._localId === editingClusterLocalId ? updatedCluster : c)
      setClusters(updatedClusters)
    } else {
      setClusters([...clusters, updatedCluster])
    }
    
    // Propagate ID change down to routes targeting this cluster if changed
    if (oldClusterId && oldClusterId !== clusterForm.clusterId) {
      setRoutes(routes.map(r => r.clusterId === oldClusterId ? { ...r, clusterId: clusterForm.clusterId } : r))
    }
    
    setEditingClusterLocalId(null)
  }

  const handleDeleteCluster = (localId: string) => {
    setClusters(clusters.filter(c => c._localId !== localId))
    if (editingClusterLocalId === localId) {
      setEditingClusterLocalId(null)
    }
  }

  const handleAddDestinationInput = () => {
    const count = destinationInputs.length + 1
    setDestinationInputs([
      ...destinationInputs,
      { id: Math.random().toString(36).slice(2, 9), name: `dest-${count}`, address: '' }
    ])
  }

  const handleUpdateDestinationInput = (id: string, field: 'name' | 'address', val: string) => {
    setDestinationInputs(destinationInputs.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val }
      }
      return item
    }))
  }

  const handleRemoveDestinationInput = (id: string) => {
    setDestinationInputs(destinationInputs.filter(item => item.id !== id))
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
            Y
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Yarp.Studio</span>
            <span className="ml-2 text-xs font-medium text-slate-400 dark:text-slate-500">v1.0.0</span>
          </div>
          {/* Commented out for future use case when we have remote connectivity */}
          {/* <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 flex items-center space-x-1.5 ml-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected: Local Dev</span>
          </Badge> */}
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

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
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
                onClick={() => { setActiveView('overview'); setEditingRouteLocalId(null); setEditingClusterLocalId(null); }}
                variant={activeView === 'overview' ? 'secondary' : 'ghost'} 
                className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'}`}
                title="Overview Map"
              >
                <Network className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-indigo-500`} />
                {!isSidebarCollapsed && <span>Overview Map</span>}
              </Button>
              <Button 
                onClick={() => { setActiveView('routes'); setEditingRouteLocalId(null); setEditingClusterLocalId(null); }}
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
                onClick={() => { setActiveView('clusters'); setEditingRouteLocalId(null); setEditingClusterLocalId(null); }}
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
                onClick={() => { setActiveView('playground'); setEditingRouteLocalId(null); setEditingClusterLocalId(null); }}
                variant={activeView === 'playground' ? 'secondary' : 'ghost'} 
                className={`w-full ${isSidebarCollapsed ? 'justify-center p-0 h-10' : 'justify-start text-left'}`}
                title="Routing Playground"
              >
                <PlayCircle className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-rose-500`} />
                {!isSidebarCollapsed && <span>Routing Playground</span>}
              </Button>
            </nav>
            
            {!isSidebarCollapsed && (
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                {/* <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Status</p> */}
                <div className="mt-2 space-y-2.5 px-3">
                  {/* <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Routes Status</span>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Healthy</Badge>
                  </div> */}
                  {/* <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">LiteDB File</span>
                    <span className="font-mono text-slate-400">yarp-studio.db</span>
                  </div> */}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {notification && !isSidebarCollapsed && (
              <div className={`p-3 rounded-md border text-xs flex items-start space-x-2 ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
              }`}>
                <div className="mt-0.5">
                  {notification.type === 'success' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                </div>
                <div className="flex-1 overflow-hidden break-words">{notification.message}</div>
              </div>
            )}
            
            {!isSidebarCollapsed}
          </div>
        </aside>

        {/* Central Layout Canvas */}
        <main className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8">
            
            {/* View D: Routing Playground */}
            {activeView === 'playground' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Routing Playground</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Simulate incoming gateway requests and visually trace how YARP matches routes, executes transforms, and selects destinations.</p>
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
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 flex items-start space-x-3">
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
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-3.5 space-y-2 font-mono text-xs text-slate-700 dark:text-slate-300">
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
                              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-3.5 space-y-3">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <div>
                                    <span className="text-slate-400">Cluster:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{playResult.cluster.clusterId}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">LB Policy:</span> {playResult.cluster.loadBalancingPolicy}
                                  </div>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
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
            )}

            {/* View A: Overview Dashboard (Topology View) */}
            {activeView === 'overview' && (
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
                    ref={topologyContainerRef}
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
                            <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Gateway Pipeline Hub</p>
                          </div>
                        </div>

                        {/* Content: Dynamic trace detail or Overview Summary */}
                        <div className="p-5 flex-1 flex flex-col justify-center min-h-[280px]">
                          {hoveredRouteId ? (
                            (() => {
                              const hoveredRoute = routes.find((r) => r.routeId === hoveredRouteId)
                              if (!hoveredRoute) return null
                              
                              const transforms = hoveredRoute.transforms || []
                              const cluster = clusters.find((c) => c.clusterId === hoveredRoute.clusterId)
                              
                              return (
                                <div className="space-y-5 animate-fadeIn">
                                  {/* Route Match summary */}
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Route match</span>
                                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 font-mono text-xs flex items-center justify-between">
                                      <span className="text-indigo-500 font-bold truncate max-w-[120px]">{hoveredRoute.routeId}</span>
                                      <span className="text-slate-400 font-bold">{hoveredRoute.match.path || '/*'}</span>
                                    </div>
                                  </div>

                                  {/* Middleware Pipeline Stages */}
                                  <div className="space-y-2.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Execution Pipeline</span>
                                    <div className="relative pl-4 border-l-2 border-indigo-500/30 dark:border-indigo-500/20 space-y-4">
                                      {/* Stage 1: Auth */}
                                      <div className="relative">
                                        <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        </span>
                                        <div className="text-xs">
                                          <div className="font-semibold text-slate-700 dark:text-slate-300">Authorization & CORS</div>
                                          <div className="text-[10px] text-slate-400">
                                            {hoveredRoute.authorizationPolicy ? `Policy: ${hoveredRoute.authorizationPolicy}` : 'Anonymous'} 
                                            {hoveredRoute.corsPolicy ? ` • CORS: ${hoveredRoute.corsPolicy}` : ''}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Stage 2: Transforms */}
                                      <div className="relative">
                                        <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        </span>
                                        <div className="text-xs">
                                          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                            <span>Path/Header Transforms</span>
                                            <Badge variant="outline" className="text-[9px] scale-90 py-0">{transforms.length} active</Badge>
                                          </div>
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
            )}

            {/* View B: Cluster Manager */}
            {activeView === 'clusters' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Cluster Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Define target endpoint instances, set up load balancing distributions, and configure health probing.</p>
                  </div>
                  {editingClusterLocalId === null && (
                    <Button onClick={handleAddCluster} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Cluster
                    </Button>
                  )}
                </div>

                {/* Edit Cluster Panel */}
                {editingClusterLocalId !== null ? (
                  <Card className="border-indigo-200 dark:border-indigo-900/50 shadow-md">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                            Editing Cluster: <span className="font-mono text-indigo-600 dark:text-indigo-400">{clusterForm.clusterId}</span>
                          </CardTitle>
                          <CardDescription>Update load balancing settings, destination instances, and health checks.</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setEditingClusterLocalId(null)}>Cancel</Button>
                          <Button onClick={handleSaveClusterForm} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Sub-form Fields */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Cluster ID</label>
                            <Input 
                              type="text" 
                              value={clusterForm.clusterId || ''} 
                              onChange={(e) => setClusterForm({ ...clusterForm, clusterId: e.target.value })}
                              placeholder="e.g. auth-cluster" 
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Unique alphanumeric string identifying this pool of endpoints.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Load Balancing Policy</label>
                            <Select 
                              value={clusterForm.loadBalancingPolicy || 'RoundRobin'} 
                              onChange={(e) => setClusterForm({ ...clusterForm, loadBalancingPolicy: e.target.value })}
                            >
                              <option value="RoundRobin">RoundRobin (Select endpoints sequentially)</option>
                              <option value="PowerOfTwoChoices">PowerOfTwoChoices (Pick two random and select best)</option>
                              <option value="Random">Random (Pick random endpoints)</option>
                              <option value="LeastRequests">LeastRequests (Assign request to least busy instance)</option>
                            </Select>
                            <p className="text-[11px] text-slate-400 mt-1">Algorithm YARP uses to distribute incoming requests across healthy destinations.</p>
                          </div>

                          {/* Health Probing Card */}
                          <Card className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                              <div>
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Health Checks</CardTitle>
                              </div>
                              <Switch 
                                checked={clusterForm.healthCheck?.active?.enabled || false}
                                onCheckedChange={(checked) => setClusterForm({
                                  ...clusterForm,
                                  healthCheck: {
                                    active: {
                                      ...clusterForm.healthCheck?.active,
                                      enabled: checked
                                    }
                                  }
                                })}
                              />
                            </CardHeader>
                            {clusterForm.healthCheck?.active?.enabled && (
                              <CardContent className="p-4 pt-2 space-y-3">
                                <div>
                                  <label className="block text-[11px] text-slate-500 mb-1 font-medium">Probe Path</label>
                                  <Input 
                                    type="text" 
                                    placeholder="/health" 
                                    value={clusterForm.healthCheck?.active?.path || ''}
                                    onChange={(e) => setClusterForm({
                                      ...clusterForm,
                                      healthCheck: {
                                        active: {
                                          ...clusterForm.healthCheck?.active,
                                          path: e.target.value
                                        }
                                      }
                                    })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Interval (TimeSpan)</label>
                                    <Input 
                                      type="text" 
                                      placeholder="00:00:10" 
                                      value={clusterForm.healthCheck?.active?.interval || ''}
                                      onChange={(e) => setClusterForm({
                                        ...clusterForm,
                                        healthCheck: {
                                          active: {
                                            ...clusterForm.healthCheck?.active,
                                            interval: e.target.value
                                          }
                                        }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Timeout (TimeSpan)</label>
                                    <Input 
                                      type="text" 
                                      placeholder="00:00:10" 
                                      value={clusterForm.healthCheck?.active?.timeout || ''}
                                      onChange={(e) => setClusterForm({
                                        ...clusterForm,
                                        healthCheck: {
                                          active: {
                                            ...clusterForm.healthCheck?.active,
                                            timeout: e.target.value
                                          }
                                        }
                                      })}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        </div>

                        {/* Right Sub-form (Destinations list) */}
                        <div className="space-y-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Destination Instances</label>
                            <Button size="sm" variant="outline" onClick={handleAddDestinationInput} className="text-xs h-7 py-0 px-2.5">
                              <PlusCircle className="mr-1 h-3.5 w-3.5" />
                              Add Instance
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {destinationInputs.length === 0 ? (
                              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-400">
                                No backend endpoints added. Click "Add Instance" to bind server nodes.
                              </div>
                            ) : (
                              destinationInputs.map((d) => (
                                <div key={d.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                                  <div className="w-1/3">
                                    <Input 
                                      type="text" 
                                      placeholder="Name (e.g. dest-1)" 
                                      value={d.name}
                                      onChange={(e) => handleUpdateDestinationInput(d.id, 'name', e.target.value)}
                                      className="h-8 font-mono text-xs"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Input 
                                      type="url" 
                                      placeholder="http://10.0.0.5:5001" 
                                      value={d.address}
                                      onChange={(e) => handleUpdateDestinationInput(d.id, 'address', e.target.value)}
                                      className="h-8 font-mono text-xs"
                                    />
                                  </div>
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8 shrink-0" 
                                    onClick={() => handleRemoveDestinationInput(d.id)}
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">Endpoints which requests are load balanced and forwarded to. Address must start with http:// or https://.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Cluster List Table */
                  <div className="space-y-4">
                    <div className="relative max-w-sm w-full group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500" />
                      <Input
                        type="text"
                        placeholder="Search clusters (ID, policy, or endpoint)..."
                        value={clusterSearchQuery}
                        onChange={(e) => setClusterSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setClusterSearchQuery('')
                          }
                        }}
                        className="h-9 text-xs pl-9 pr-8 w-full bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 transition-all duration-200"
                      />
                      {clusterSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setClusterSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Clear search (Esc)"
                        >
                          <X className="h-3 w-3 transition-transform duration-200 hover:rotate-90" />
                        </button>
                      )}
                    </div>

                    <Card>
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-950">
                          <TableRow>
                            <TableHead className="w-1/5">Cluster ID</TableHead>
                            <TableHead>Policy</TableHead>
                            <TableHead>Probing</TableHead>
                            <TableHead>Destinations</TableHead>
                            <TableHead>Health Status</TableHead>
                            <TableHead className="text-right w-32">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClusters.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                                {clusterSearchQuery ? 'No clusters match your search query.' : 'No clusters configured. Click "Add Cluster" above to begin.'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredClusters.map((c) => {
                              const destKeys = Object.keys(c.destinations || {})
                              return (
                                <TableRow key={c._localId} className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30" onClick={() => handleEditCluster(c)}>
                                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">{c.clusterId}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs">{c.loadBalancingPolicy}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {c.healthCheck?.active?.enabled ? (
                                      <Badge variant="success" className="text-[10px] font-medium flex items-center space-x-1 w-fit">
                                        <Activity className="h-2.5 w-2.5" />
                                        <span>Active ({c.healthCheck?.active?.path})</span>
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-slate-400">Disabled</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col space-y-1">
                                      {destKeys.slice(0, 3).map(key => (
                                        <div key={key} className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                          <span className="text-slate-400">{key}:</span> {c.destinations?.[key]?.address}
                                        </div>
                                      ))}
                                      {destKeys.length > 3 && (
                                        <span className="text-[10px] text-slate-400 italic">+{destKeys.length - 3} more</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {(() => {
                                      const statusInfo = proxyStatus.find(s => s.clusterId === c.clusterId)
                                      if (!statusInfo) return <span className="text-xs text-slate-400 font-mono">Unknown</span>
                                      const healthyCount = statusInfo.destinations.filter(d => d.isHealthy).length
                                      const totalCount = statusInfo.destinations.length
                                      return (
                                        <div className="flex flex-col space-y-1">
                                          <Badge 
                                            className={`text-[10px] w-fit font-semibold ${
                                              healthyCount === totalCount ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                                              healthyCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                                              'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                                            }`}
                                          >
                                            {healthyCount}/{totalCount} Healthy
                                          </Badge>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {statusInfo.destinations.map(d => (
                                              <span 
                                                key={d.destinationId} 
                                                className={`h-2 w-2 rounded-full inline-block ${
                                                  d.healthActive === 'Healthy' ? 'bg-emerald-500' :
                                                  d.healthActive === 'Unhealthy' ? 'bg-red-500' :
                                                  'bg-slate-400'
                                                }`} 
                                                title={`${d.destinationId} (${d.address}): Active=${d.healthActive}, Passive=${d.healthPassive}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </TableCell>
                                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" size="sm" onClick={() => handleEditCluster(c)}>Edit</Button>
                                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteCluster(c._localId || '')}>
                                        <Trash className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* View C: Interactive Route Builder */}
            {activeView === 'routes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Route Builder</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Define matcher patterns to match incoming requests, configure transform pipelines, and dispatch traffic to target clusters.</p>
                  </div>
                  {editingRouteLocalId === null && (
                    <Button onClick={handleAddRoute} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Route
                    </Button>
                  )}
                </div>

                {/* Edit Route Panel */}
                {editingRouteLocalId !== null ? (
                  <Card className="border-indigo-200 dark:border-indigo-900/50 shadow-md">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                            Editing Route: <span className="font-mono text-indigo-600 dark:text-indigo-400">{routeForm.routeId}</span>
                          </CardTitle>
                          <CardDescription>Define how YARP matches incoming URLs and what modifications it applies before proxying.</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setEditingRouteLocalId(null)}>Cancel</Button>
                          <Button onClick={handleSaveRouteForm} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Sub-form: Match criteria & Target */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Route ID</label>
                            <Input 
                              type="text" 
                              value={routeForm.routeId || ''} 
                              onChange={(e) => setRouteForm({ ...routeForm, routeId: e.target.value })}
                              placeholder="e.g. auth-route" 
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Unique identifier string for this route rule definition.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Path Matcher Pattern</label>
                            <Input 
                              type="text" 
                              value={routeForm.match?.path || ''} 
                              onChange={(e) => setRouteForm({
                                ...routeForm,
                                match: { ...routeForm.match, path: e.target.value }
                              })}
                              placeholder="e.g. /api/v1/auth/{**catch-all}" 
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Relative request path matching. Use <span className="font-mono font-bold">{`{**catch-all}`}</span> for wildcard nesting.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Host Matcher (Comma-separated)</label>
                            <Input 
                              type="text" 
                              value={routeForm.match?.hosts?.join(', ') || ''} 
                              onChange={(e) => {
                                const hostsArr = e.target.value.split(',').map(h => h.trim()).filter(h => h !== '')
                                setRouteForm({
                                  ...routeForm,
                                  match: { ...routeForm.match, hosts: hostsArr }
                                })
                              }}
                              placeholder="e.g. example.com, api.example.com" 
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Match requests by Host headers. If empty, all hosts will match.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Target Cluster ID</label>
                            <Select 
                              value={routeForm.clusterId || ''} 
                              onChange={(e) => setRouteForm({ ...routeForm, clusterId: e.target.value })}
                            >
                              <option value="">-- Select Target Backend Cluster --</option>
                              {clusters.map(c => (
                                <option key={c.clusterId} value={c.clusterId}>{c.clusterId}</option>
                              ))}
                            </Select>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Select a cluster to route requests to. Must be populated from the Cluster Manager.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Authorization Policy</label>
                              <Input 
                                type="text" 
                                value={routeForm.authorizationPolicy || ''} 
                                onChange={(e) => setRouteForm({ ...routeForm, authorizationPolicy: e.target.value })}
                                placeholder="e.g. Default" 
                              />
                              <p className="text-[11px] text-slate-400 mt-1">
                                Policy name registered in application.
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">CORS Policy</label>
                              <Input 
                                type="text" 
                                value={routeForm.corsPolicy || ''} 
                                onChange={(e) => setRouteForm({ ...routeForm, corsPolicy: e.target.value })}
                                placeholder="e.g. AllowAll" 
                              />
                              <p className="text-[11px] text-slate-400 mt-1">
                                Policy name registered in application.
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">HTTP Methods</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].map((method) => {
                                const isChecked = routeForm.match?.methods?.includes(method) || false
                                return (
                                  <Button 
                                    key={method} 
                                    type="button" 
                                    variant={isChecked ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleAddMethodToRoute(method)}
                                    className={`text-xs py-1 px-3 ${isChecked ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                                  >
                                    {method}
                                  </Button>
                                )
                              })}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">HTTP methods to match. If empty, all methods will match.</p>
                          </div>
                        </div>

                        {/* Right Sub-form: Transforms Pipeline */}
                        <div className="space-y-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-900">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Transform Pipeline</label>
                            
                            {/* Transform Adder Dropdown */}
                            <Select 
                              className="w-48 h-8 py-0.5 text-xs" 
                              value=""
                              onChange={(e) => {
                                if (e.target.value !== "") {
                                  handleAddTransform(e.target.value)
                                  e.target.value = "" // Reset select
                                }
                              }}
                            >
                              <option value="">+ Add Transform Rule</option>
                              <option value="PathRemovePrefix">PathRemovePrefix</option>
                              <option value="PathPrefix">PathPrefix</option>
                              <option value="PathSet">PathSet</option>
                              <option value="RequestHeaderAdd">RequestHeaderAdd</option>
                              <option value="ResponseHeader">ResponseHeader</option>
                              <option value="QueryParameter">QueryParameter</option>
                              <option value="X-Forwarded-Host">X-Forwarded-Host</option>
                              <option value="Custom">Custom Key-Value</option>
                            </Select>
                          </div>

                          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                            {(!routeForm.transforms || routeForm.transforms.length === 0) ? (
                              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-400">
                                No transformation rules configured. Select a rule type above to alter path prefixes or headers.
                              </div>
                            ) : (
                              routeForm.transforms.map((t, idx) => {
                                
                                // PathRemovePrefix
                                if (t.hasOwnProperty('PathRemovePrefix')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20">PathRemovePrefix</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-500">Remove Prefix Value</label>
                                        <Input 
                                          type="text" 
                                          value={t.PathRemovePrefix || ''} 
                                          onChange={(e) => handleUpdateTransformValue(idx, 'PathRemovePrefix', e.target.value)}
                                          className="h-8 text-xs font-mono"
                                        />
                                      </div>
                                    </div>
                                  )
                                }

                                // PathPrefix
                                if (t.hasOwnProperty('PathPrefix')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20">PathPrefix</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-500">Add Prefix Value</label>
                                        <Input 
                                          type="text" 
                                          value={t.PathPrefix || ''} 
                                          onChange={(e) => handleUpdateTransformValue(idx, 'PathPrefix', e.target.value)}
                                          className="h-8 text-xs font-mono"
                                        />
                                      </div>
                                    </div>
                                  )
                                }

                                // PathSet
                                if (t.hasOwnProperty('PathSet')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20">PathSet</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-500">Path Value</label>
                                        <Input 
                                          type="text" 
                                          value={t.PathSet || ''} 
                                          onChange={(e) => handleUpdateTransformValue(idx, 'PathSet', e.target.value)}
                                          className="h-8 text-xs font-mono"
                                        />
                                      </div>
                                    </div>
                                  )
                                }

                                // RequestHeaderAdd
                                if (t.hasOwnProperty('RequestHeader')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">RequestHeaderAdd</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Header Key</label>
                                          <Input 
                                            type="text" 
                                            value={t.RequestHeader || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'RequestHeader', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Header Value</label>
                                          <Input 
                                            type="text" 
                                            value={t.Set || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'Set', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // ResponseHeader
                                if (t.hasOwnProperty('ResponseHeader')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20">ResponseHeader</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Header</label>
                                          <Input 
                                            type="text" 
                                            value={t.ResponseHeader || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'ResponseHeader', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Value</label>
                                          <Input 
                                            type="text" 
                                            value={t.Set || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'Set', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">When</label>
                                          <Select 
                                            value={t.When || 'Always'} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'When', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          >
                                            <option value="Always">Always</option>
                                            <option value="Success">Success</option>
                                            <option value="Failure">Failure</option>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // QueryParameter
                                if (t.hasOwnProperty('QueryParameter')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20">QueryParameter</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Param Key</label>
                                          <Input 
                                            type="text" 
                                            value={t.QueryParameter || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'QueryParameter', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Value (Set)</label>
                                          <Input 
                                            type="text" 
                                            value={t.Set || ''} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'Set', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // X-Forwarded
                                if (t.hasOwnProperty('X-Forwarded')) {
                                  return (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">X-Forwarded-Host</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">X-Forwarded Action</label>
                                          <Input 
                                            type="text" 
                                            value={t['X-Forwarded'] || 'Set'} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'X-Forwarded', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                            disabled
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-slate-500">Prefix</label>
                                          <Input 
                                            type="text" 
                                            value={t.Prefix || 'true'} 
                                            onChange={(e) => handleUpdateTransformValue(idx, 'Prefix', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // Unrecognized/Generic Transform Key-Value Grid
                                return (
                                  <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative animate-fade-in">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">Custom/Generic</Badge>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {Object.entries(t).map(([k, v]) => (
                                        <div key={k} className="flex items-center space-x-2">
                                          <Input 
                                            type="text" 
                                            placeholder="Key" 
                                            value={k}
                                            onChange={(e) => {
                                              const newKey = e.target.value;
                                              const currentTransforms = [...(routeForm.transforms || [])]
                                              const currentItem = { ...currentTransforms[idx] }
                                              delete currentItem[k]
                                              currentItem[newKey] = v
                                              currentTransforms[idx] = currentItem
                                              setRouteForm({ ...routeForm, transforms: currentTransforms })
                                            }}
                                            className="h-8 text-xs font-mono w-1/2"
                                          />
                                          <Input 
                                            type="text" 
                                            placeholder="Value" 
                                            value={v}
                                            onChange={(e) => handleUpdateTransformValue(idx, k, e.target.value)}
                                            className="h-8 text-xs font-mono w-1/2"
                                          />
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-slate-400 hover:text-red-500" 
                                            onClick={() => {
                                              const currentTransforms = [...(routeForm.transforms || [])]
                                              const currentItem = { ...currentTransforms[idx] }
                                              delete currentItem[k]
                                              currentTransforms[idx] = currentItem
                                              setRouteForm({ ...routeForm, transforms: currentTransforms })
                                            }}
                                          >
                                            <Trash className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-[10px] h-6 py-0 px-2 border-slate-200 dark:border-slate-800"
                                        onClick={() => {
                                          const currentTransforms = [...(routeForm.transforms || [])]
                                          const currentItem = { ...currentTransforms[idx] }
                                          currentItem[`NewKey-${Math.random().toString(36).slice(2, 5)}`] = ''
                                          currentTransforms[idx] = currentItem
                                          setRouteForm({ ...routeForm, transforms: currentTransforms })
                                        }}
                                      >
                                        + Add Field
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Route Table List */
                  <div className="space-y-4">
                    <div className="relative max-w-sm w-full group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500" />
                      <Input
                        type="text"
                        placeholder="Search routes (ID, path, or cluster)..."
                        value={routeSearchQuery}
                        onChange={(e) => setRouteSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setRouteSearchQuery('')
                          }
                        }}
                        className="h-9 text-xs pl-9 pr-8 w-full bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 transition-all duration-200"
                      />
                      {routeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setRouteSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Clear search (Esc)"
                        >
                          <X className="h-3 w-3 transition-transform duration-200 hover:rotate-90" />
                        </button>
                      )}
                    </div>

                    <Card>
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-950">
                          <TableRow>
                            <TableHead className="w-1/4">Route ID</TableHead>
                            <TableHead>Path Matcher</TableHead>
                            <TableHead>Methods</TableHead>
                            <TableHead>Target Cluster</TableHead>
                            <TableHead>Transforms</TableHead>
                            <TableHead className="text-right w-32">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                                No routes configured. Click "Add Route" above to begin.
                              </TableCell>
                            </TableRow>
                          ) : filteredRoutes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                                No routes match your search query.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRoutes.map((r) => (
                              <TableRow key={r._localId} className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30" onClick={() => handleEditRoute(r)}>
                                <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">{r.routeId}</TableCell>
                                <TableCell className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{r.match.path || '/*'}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {(r.match.methods && r.match.methods.length > 0) ? r.match.methods.map(m => (
                                      <Badge key={m} variant="secondary" className="text-[10px] px-1 py-0">{m}</Badge>
                                    )) : (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 text-slate-400 border-slate-200">ANY</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {r.clusterId ? (
                                    <Badge variant="outline" className="font-mono text-xs text-indigo-600 border-indigo-200 bg-indigo-50/50 dark:text-indigo-400 dark:border-indigo-900/30">
                                      {r.clusterId}
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-[10px]">No Cluster Target</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {(r.transforms && r.transforms.length > 0) ? r.transforms.map((t, index) => (
                                      <Badge key={index} variant="outline" className="text-[10px] font-mono border-slate-200 bg-white dark:bg-slate-800">
                                        {Object.keys(t)[0]}
                                      </Badge>
                                    )) : (
                                      <span className="text-slate-400 text-xs">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditRoute(r)}>Edit</Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteRoute(r._localId || '')}>
                                      <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Panel: Split Preview & Validation Panel */}
          <div className={`${isRightPanelCollapsed ? 'w-16 p-2' : 'w-[450px] p-0'} border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden shrink-0 transition-all duration-300`}>
            {isRightPanelCollapsed ? (
              <div className="flex flex-col items-center space-y-6 pt-2 h-full justify-between pb-4">
                <div className="flex flex-col items-center space-y-6">
                  {/* Expand button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsRightPanelCollapsed(false)} 
                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                    title="Expand Panel"
                  >
                    <PanelRightOpen className="h-4 w-4" />
                  </Button>

                  {/* Icon Indicators */}
                  <div className="flex flex-col items-center space-y-4">
                    <div title="Config Footprint">
                      <FileJson className="h-5 w-5 text-indigo-500" />
                    </div>
                    
                    {/* Validation indicator icon */}
                    {validationErrors.length > 0 ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500" title={`Validation Blockers (${validationErrors.length})`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500" title="Schema Integrity Intact">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical rotation text */}
                <div className="text-slate-400 dark:text-slate-500 font-semibold tracking-wider text-[11px] uppercase select-none rotate-90 my-8 origin-center whitespace-nowrap">
                  Config Footprint
                </div>
              </div>
            ) : (
              <Tabs defaultValue="visual" value={activeTab} onValueChange={(val) => setActiveTab(val as 'visual' | 'json')} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <FileJson className="h-4 w-4 text-indigo-500" />
                    <span>Config Footprint</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <TabsList className="h-8">
                      <TabsTrigger value="visual" className="text-xs py-1">Info</TabsTrigger>
                      <TabsTrigger value="json" className="text-xs py-1">JSON Preview</TabsTrigger>
                    </TabsList>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsRightPanelCollapsed(true)} 
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      title="Collapse Panel"
                    >
                      <PanelRightClose className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Validation & Guide Area */}
                <TabsContent value="visual" className="flex-1 overflow-y-auto p-6 space-y-6 focus:outline-none">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      <span>Real-time Gateway Auditing</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Local YARP schema validation runs on every edit loop to protect Gateway integrity.</p>
                  </div>

                  <div className="space-y-4">
                    {validationErrors.length > 0 ? (
                      <Alert variant="destructive">
                        <div className="flex space-x-2.5">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <AlertTitle className="text-red-800 dark:text-red-400 font-bold">Validation Blockers ({validationErrors.length})</AlertTitle>
                            <AlertDescription className="mt-2 text-xs text-red-700 dark:text-red-400/90 space-y-2">
                              <ul className="list-disc pl-4 space-y-1.5">
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
                          <Check className="h-4 w-4" />
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

                {/* Code Prevew Panel */}
                <TabsContent value="json" className="flex-1 overflow-hidden flex flex-col p-4 focus:outline-none">
                  <div className="flex-1 bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto font-mono text-xs shadow-inner select-all relative">
                    <span className="absolute top-2 right-2 text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider select-none">READ ONLY</span>
                    <pre className="whitespace-pre">
                      {JSON.stringify({ Routes: routes, Clusters: clusters }, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

        </main>

      </div>
    </div>
  )
}
