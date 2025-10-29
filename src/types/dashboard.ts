export interface FunnelMetrics {
  timestamp: string;
  funnel_stage?: 'visitors' | 'next_page' | 'phone_collected' | 'activation';
  conversion_rate?: number;
  drop_off_rate?: number;
  comparison_delta?: number;
  layer?: 'client' | 'server' | 'provider' | 'data_quality';
  metric_name?: string;
  target_value?: string;
  current_value?: number;
  status?: 'healthy' | 'warning' | 'critical';
  unit?: string;
}

export interface Alert {
  id?: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp?: string;
  created_date?: string;
  related_layer?: 'client' | 'server' | 'provider' | 'data_quality';
  is_resolved?: boolean;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion: number;
  dropOff: number;
  delta: number;
  color: string;
}

export interface ReliabilityMetric {
  layer: string;
  metric: string;
  target: string;
  current: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface TrendData {
  title: string;
  data: { time: string; value: number }[];
  color: string;
  unit: string;
  current: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
}

// Root Cause Drilldown Types
export interface RootCauseFactor {
  layer: 'client' | 'server' | 'provider' | 'data_quality';
  cause: string;
  likelihood: 'high' | 'medium' | 'low';
  evidence: string;
  impact: number; // 0-100
}

export interface SegmentationData {
  country: { name: string; affected: number; total: number }[];
  browser: { name: string; affected: number; total: number }[];
  trafficSource: { name: string; affected: number; total: number }[];
}

export interface LatencyDataPoint {
  time: string;
  latency: number;
  threshold: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  service: string;
}

export interface TopError {
  message: string;
  count: number;
  layer: 'client' | 'server' | 'provider' | 'data_quality';
  severity: 'critical' | 'warning' | 'info';
  lastOccurrence: string;
}
