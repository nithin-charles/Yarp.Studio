export interface RouteMatch {
  path?: string;
  hosts?: string[];
  methods?: string[];
  headers?: any[];
  queryParameters?: any[];
}

export interface RouteConfig {
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

export interface DestinationConfig {
  address: string;
  [key: string]: any;
}

export interface ActiveHealthCheck {
  enabled?: boolean;
  interval?: string; // e.g. "00:00:10"
  timeout?: string;
  policy?: string;
  path?: string;
}

export interface HealthCheckConfig {
  active?: ActiveHealthCheck;
}

export interface ClusterConfig {
  _localId?: string;
  clusterId: string;
  loadBalancingPolicy?: string;
  healthCheck?: HealthCheckConfig;
  destinations?: Record<string, DestinationConfig>;
  [key: string]: any;
}

export interface DestinationStatus {
  destinationId: string;
  address: string;
  healthActive: string;
  healthPassive: string;
  isHealthy: boolean;
}

export interface ClusterStatus {
  clusterId: string;
  destinations: DestinationStatus[];
}
