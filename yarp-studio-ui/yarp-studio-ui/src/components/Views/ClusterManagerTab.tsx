import React, { useState } from 'react'
import { Plus, Trash, Search, X, Activity, PlusCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { useApp } from '../../context/AppContext'
import type { ClusterConfig, DestinationConfig } from '../../types/yarp'

export const ClusterManagerTab: React.FC = () => {
  const {
    routes,
    setRoutes,
    clusters,
    setClusters,
    clusterSearchQuery,
    setClusterSearchQuery,
    filteredClusters,
    proxyStatus
  } = useApp()

  // Local editing states
  const [editingClusterLocalId, setEditingClusterLocalId] = useState<string | null>(null)
  const [clusterForm, setClusterForm] = useState<Partial<ClusterConfig>>({
    clusterId: '',
    loadBalancingPolicy: 'RoundRobin',
    healthCheck: { active: { enabled: false, interval: '00:00:10', path: '/health' } },
    destinations: {}
  })
  
  // Destination helper array to hold key-value pairs while editing
  const [destinationInputs, setDestinationInputs] = useState<{ id: string; name: string; address: string }[]>([])

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
                              <div className="flex flex-col space-y-1" onClick={(e) => e.stopPropagation()}>
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
  )
}
