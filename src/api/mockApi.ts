import { FunnelMetrics, Alert, TopError, RootCauseFactor, SegmentationData, LatencyDataPoint, LogEntry } from '../types/dashboard.js';

// Mock data generator
export const mockApi = {
  getMetrics: async (): Promise<FunnelMetrics[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      // Funnel stage metrics - Updated values
      {
        timestamp: new Date().toISOString(),
        funnel_stage: 'visitors',
        conversion_rate: 100,
        drop_off_rate: 0,
        comparison_delta: 0,
        current_value: 3014
      },
      {
        timestamp: new Date().toISOString(),
        funnel_stage: 'next_page',
        conversion_rate: 82.0,
        drop_off_rate: 18.0,
        comparison_delta: -2.3,
        current_value: 2471
      },
      {
        timestamp: new Date().toISOString(),
        funnel_stage: 'phone_collected',
        conversion_rate: 75.6,
        drop_off_rate: 24.4,
        comparison_delta: -3.8,
        current_value: 1868
      },
      {
        timestamp: new Date().toISOString(),
        funnel_stage: 'activation',
        conversion_rate: 5.1,
        drop_off_rate: 94.9,
        comparison_delta: 1.2,
        current_value: 96
      },
      // Reliability metrics
      {
        timestamp: new Date().toISOString(),
        layer: 'client',
        metric_name: 'User Response Success',
        target_value: '≥ 95%',
        current_value: 92.5,
        status: 'warning',
        unit: '%'
      },
      {
        timestamp: new Date().toISOString(),
        layer: 'server',
        metric_name: 'Validation Request Success Rate',
        target_value: '≥ 98%',
        current_value: 96.5,
        status: 'warning',
        unit: '%'
      },
      {
        timestamp: new Date().toISOString(),
        layer: 'provider',
        metric_name: 'Phone Validation Error Rate',
        target_value: '< 5%',
        current_value: 7.2,
        status: 'critical',
        unit: '%'
      },
      {
        timestamp: new Date().toISOString(),
        layer: 'data_quality',
        metric_name: 'Event Completeness & Accuracy',
        target_value: '≥ 99.5%',
        current_value: 99.8,
        status: 'healthy',
        unit: '%'
      }
    ];
  },

  getAlerts: async (): Promise<Alert[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 1,
        message: "Spike detected in Abandon Rate (+1.2% vs baseline)",
        severity: "critical",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        related_layer: "client",
        is_resolved: false
      },
      {
        id: 2,
        message: "Server response time exceeded SLA (1.05s > 0.8s)",
        severity: "critical",
        timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
        related_layer: "server",
        is_resolved: false
      },
      {
        id: 3,
        message: "Provider returning rate-limit errors (HTTP 429)",
        severity: "warning",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        related_layer: "provider",
        is_resolved: false
      },
      {
        id: 4,
        message: "Event completeness below threshold (99.2% < 99.5%)",
        severity: "warning",
        timestamp: new Date(Date.now() - 67 * 60 * 1000).toISOString(),
        related_layer: "data_quality",
        is_resolved: false
      }
    ];
  },

  getTopErrors: async (): Promise<TopError[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      {
        message: "Server response time exceeded SLA",
        count: 47,
        layer: "server",
        severity: "critical",
        lastOccurrence: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        message: "Abandon Rate spike detected",
        count: 38,
        layer: "client",
        severity: "critical",
        lastOccurrence: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        message: "Provider rate-limit errors",
        count: 22,
        layer: "provider",
        severity: "warning",
        lastOccurrence: new Date(Date.now() - 28 * 60 * 1000).toISOString()
      },
      {
        message: "Event completeness degraded",
        count: 15,
        layer: "data_quality",
        severity: "warning",
        lastOccurrence: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ];
  },

  getRootCauseFactors: async (alertId: number): Promise<RootCauseFactor[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Different root causes based on alert ID
    const rootCauses: Record<number, RootCauseFactor[]> = {
      1: [ // Client abandon rate spike
        {
          layer: "client",
          cause: "High JavaScript error rate in form validation",
          likelihood: "high",
          evidence: "Error rate increased 3x in the last hour",
          impact: 65
        },
        {
          layer: "client",
          cause: "Mobile Safari rendering issue",
          likelihood: "medium",
          evidence: "85% of abandons from iOS Safari",
          impact: 25
        },
        {
          layer: "server",
          cause: "Delayed phone validation API response",
          likelihood: "low",
          evidence: "P95 latency within acceptable range",
          impact: 10
        }
      ],
      2: [ // Server response time
        {
          layer: "server",
          cause: "Database connection pool exhaustion",
          likelihood: "high",
          evidence: "Connection pool at 98% capacity",
          impact: 70
        },
        {
          layer: "server",
          cause: "Increased query complexity",
          likelihood: "medium",
          evidence: "Slow query log showing +45% execution time",
          impact: 20
        },
        {
          layer: "provider",
          cause: "Third-party SMS verification delays",
          likelihood: "low",
          evidence: "Provider latency P95: 450ms (normal)",
          impact: 10
        }
      ],
      3: [ // Provider rate-limit
        {
          layer: "provider",
          cause: "SMS provider rate limit exceeded",
          likelihood: "high",
          evidence: "HTTP 429 responses increased 10x",
          impact: 80
        },
        {
          layer: "server",
          cause: "Retry logic not properly backoff",
          likelihood: "medium",
          evidence: "Retry attempts within 100ms window",
          impact: 15
        },
        {
          layer: "client",
          cause: "Duplicate submission attempts",
          likelihood: "low",
          evidence: "Only 5% of requests are duplicates",
          impact: 5
        }
      ],
      4: [ // Data quality
        {
          layer: "data_quality",
          cause: "Event tracking script loading failure",
          likelihood: "high",
          evidence: "Script 404 errors on 2% of page loads",
          impact: 60
        },
        {
          layer: "data_quality",
          cause: "Browser privacy settings blocking events",
          likelihood: "medium",
          evidence: "Correlation with Firefox strict mode",
          impact: 30
        },
        {
          layer: "server",
          cause: "Event ingestion pipeline delay",
          likelihood: "low",
          evidence: "Pipeline lag under 50ms threshold",
          impact: 10
        }
      ]
    };

    return rootCauses[alertId] || rootCauses[1];
  },

  getSegmentation: async (_alertId: number): Promise<SegmentationData> => {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
      country: [
        { name: "USA", affected: 145, total: 1200 },
        { name: "UK", affected: 38, total: 450 },
        { name: "Canada", affected: 22, total: 320 },
        { name: "Germany", affected: 18, total: 280 }
      ],
      browser: [
        { name: "Chrome", affected: 89, total: 1100 },
        { name: "Safari", affected: 67, total: 680 },
        { name: "Firefox", affected: 45, total: 420 },
        { name: "Edge", affected: 22, total: 250 }
      ],
      trafficSource: [
        { name: "Organic", affected: 98, total: 980 },
        { name: "Paid", affected: 76, total: 890 },
        { name: "Direct", affected: 34, total: 450 },
        { name: "Referral", affected: 15, total: 230 }
      ]
    };
  },

  getLatencyData: async (_alertId: number, timeRange: string): Promise<LatencyDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 250));

    const points: Record<string, number> = { '1h': 12, '24h': 24, '7d': 7, '30d': 30 };
    const count = points[timeRange] || 24;

    const generateTimeLabel = (index: number) => {
      if (timeRange === '1h') return `${index * 5}m`;
      if (timeRange === '24h') return `${index}h`;
      if (timeRange === '7d') return `Day ${index + 1}`;
      return `Day ${index + 1}`;
    };

    return Array.from({ length: count }, (_, i) => {
      const baseLatency = 650;
      const spikeStart = Math.floor(count * 0.3);
      const spikeEnd = Math.floor(count * 0.7);
      const isInSpike = i >= spikeStart && i < spikeEnd;

      const latency = isInSpike
        ? baseLatency + Math.random() * 400 + 200
        : baseLatency + Math.random() * 150 - 50;

      return {
        time: generateTimeLabel(i),
        latency: Math.round(latency),
        threshold: 800
      };
    });
  },

  getLogs: async (_alertId: number): Promise<LogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const now = Date.now();
    const logs: LogEntry[] = [
      {
        timestamp: new Date(now - 2 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "error",
        message: "Database connection pool exhausted, waiting for available connection",
        service: "api-server"
      },
      {
        timestamp: new Date(now - 3 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "warning",
        message: "Slow query detected: SELECT * FROM users WHERE phone_verified=true (2.3s)",
        service: "postgres"
      },
      {
        timestamp: new Date(now - 5 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "error",
        message: "SMS provider API returned 429 Too Many Requests",
        service: "sms-gateway"
      },
      {
        timestamp: new Date(now - 7 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "info",
        message: "Connection pool size increased from 20 to 30",
        service: "api-server"
      },
      {
        timestamp: new Date(now - 10 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "warning",
        message: "High abandon rate detected on phone collection step (3.2%)",
        service: "analytics"
      },
      {
        timestamp: new Date(now - 12 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "error",
        message: "Failed to validate phone number: network timeout after 5s",
        service: "validation-service"
      },
      {
        timestamp: new Date(now - 15 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "info",
        message: "Rate limiter triggered: 150 requests/min exceeded (actual: 178)",
        service: "api-gateway"
      },
      {
        timestamp: new Date(now - 18 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "warning",
        message: "Event tracking script failed to load (404) on 2.1% of page views",
        service: "tracking-monitor"
      },
      {
        timestamp: new Date(now - 20 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "error",
        message: "JavaScript exception in form validation: Cannot read property 'value' of null",
        service: "client-errors"
      },
      {
        timestamp: new Date(now - 23 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "info",
        message: "Auto-scaling triggered: Added 2 new server instances",
        service: "orchestrator"
      },
      {
        timestamp: new Date(now - 25 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "warning",
        message: "Memory usage high: 87% of allocated heap used",
        service: "api-server"
      },
      {
        timestamp: new Date(now - 28 * 60 * 1000).toISOString().split('T')[1].slice(0, 8),
        level: "error",
        message: "Provider API timeout: SMS verification request failed after 10s",
        service: "sms-gateway"
      }
    ];

    return logs;
  }
};
