import React, { useState } from 'react'
import { Plus, Trash, Search, X, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { useApp } from '../../context/AppContext'
import type { RouteConfig } from '../../types/yarp'

export const RouteBuilderTab: React.FC = () => {
  const {
    routes,
    setRoutes,
    clusters,
    routeSearchQuery,
    setRouteSearchQuery,
    filteredRoutes
  } = useApp()

  // Local editing states
  const [editingRouteLocalId, setEditingRouteLocalId] = useState<string | null>(null)
  const [routeForm, setRouteForm] = useState<Partial<RouteConfig>>({
    routeId: '',
    match: { path: '', methods: [], hosts: [] },
    clusterId: '',
    transforms: []
  })

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

  return (
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">HTTP Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].map((m) => {
                      const active = routeForm.match?.methods?.includes(m)
                      return (
                        <Button
                          key={m}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAddMethodToRoute(m)}
                          className="text-xs h-8"
                        >
                          {m}
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">Select specific HTTP verbs. If none selected, any method is accepted.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Authorization Policy</label>
                    <Select 
                      value={routeForm.authorizationPolicy || ''} 
                      onChange={(e) => setRouteForm({ ...routeForm, authorizationPolicy: e.target.value })}
                    >
                      <option value="">Default (Anonymous)</option>
                      <option value="Default">Default Policy (Authenticated)</option>
                      <option value="AdminOnly">AdminOnly Custom</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">CORS Policy</label>
                    <Select 
                      value={routeForm.corsPolicy || ''} 
                      onChange={(e) => setRouteForm({ ...routeForm, corsPolicy: e.target.value })}
                    >
                      <option value="">Default (None)</option>
                      <option value="Default">Default Policy</option>
                      <option value="FreeCors">FreeCors (Permissive)</option>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Target Cluster Pool</label>
                  {clusters.length === 0 ? (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/30 p-3.5 rounded-lg flex items-center space-x-2 text-amber-800 dark:text-amber-400 text-xs">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>No Clusters configured! Add a cluster first.</span>
                    </div>
                  ) : (
                    <Select 
                      value={routeForm.clusterId || ''} 
                      onChange={(e) => setRouteForm({ ...routeForm, clusterId: e.target.value })}
                    >
                      <option value="">-- Select Target Cluster --</option>
                      {clusters.map((c) => (
                        <option key={c.clusterId} value={c.clusterId}>
                          {c.clusterId} ({Object.keys(c.destinations || {}).length} nodes)
                        </option>
                      ))}
                    </Select>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">Choose the downstream backend service pool YARP forwards matched requests to.</p>
                </div>
              </div>

              {/* Right Sub-form: Transforms pipeline */}
              <div className="space-y-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Transforms Pipeline Builder</label>
                  <Select 
                    value="" 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTransform(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="w-40 text-xs h-7 py-0.5"
                  >
                    <option value="">+ Add Transform</option>
                    <option value="PathRemovePrefix">PathRemovePrefix</option>
                    <option value="PathPrefix">PathPrefix</option>
                    <option value="PathSet">PathSet</option>
                    <option value="RequestHeaderAdd">RequestHeaderAdd</option>
                    <option value="ResponseHeader">ResponseHeader</option>
                    <option value="QueryParameter">QueryParameter</option>
                    <option value="X-Forwarded-Host">X-Forwarded-Host</option>
                    <option value="Custom">Custom/Generic</option>
                  </Select>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {(routeForm.transforms || []).length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-400">
                      No HTTP transformations configured. Requests will pass through unchanged.
                    </div>
                  ) : (
                    (routeForm.transforms || []).map((t, idx) => {
                      // PathRemovePrefix
                      if (t.hasOwnProperty('PathRemovePrefix')) {
                        return (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20">PathRemovePrefix</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-500">Prefix to strip</label>
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
                              <Badge variant="outline" className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20">PathPrefix</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveTransform(idx)}>
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-500">Prefix to append</label>
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

                      // Unrecognized/Custom Generic Transform Key-Value Grid
                      return (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-100 dark:border-slate-800 space-y-2 relative">
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
                            <Badge key={index} variant="outline" className="text-[10px] font-mono border-slate-200 bg-white dark:bg-slate-850">
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
  )
}
