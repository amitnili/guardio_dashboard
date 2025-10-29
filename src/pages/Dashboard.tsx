import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

import FunnelOverview from "../components/dashboard/FunnelOverview";
import ReliabilityMetrics from "../components/dashboard/ReliabilityMetrics";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import TrendGraphs from "../components/dashboard/TrendGraphs";
import BusinessImpactLayer from "../components/dashboard/BusinessImpactLayer";
import HealthSummary from "../components/dashboard/HealthSummary";
import RootCauseDrilldownPanel from "../components/dashboard/RootCauseDrilldownPanel";

import { transformFunnelData, transformReliabilityMetrics } from "../utils/dashboardData";
import { mockApi } from "../api/mockApi";
import type { Alert, FunnelMetrics, TopError, RootCauseFactor, SegmentationData, LatencyDataPoint, LogEntry } from "../types/dashboard";

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const {
    data: alerts = [],
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: mockApi.getAlerts,
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 2,
  });

  const {
    data: metrics = [],
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery<FunnelMetrics[]>({
    queryKey: ['metrics'],
    queryFn: mockApi.getMetrics,
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 2,
  });

  const {
    data: topErrors = [],
    refetch: refetchTopErrors
  } = useQuery<TopError[]>({
    queryKey: ['topErrors'],
    queryFn: mockApi.getTopErrors,
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 2,
  });

  // Root cause drilldown data - only fetch when an alert is selected
  const {
    data: rootCauseFactors = []
  } = useQuery<RootCauseFactor[]>({
    queryKey: ['rootCause', selectedAlert?.id],
    queryFn: () => mockApi.getRootCauseFactors(selectedAlert?.id || 1),
    enabled: !!selectedAlert,
    retry: 2,
  });

  const {
    data: segmentation
  } = useQuery<SegmentationData>({
    queryKey: ['segmentation', selectedAlert?.id],
    queryFn: () => mockApi.getSegmentation(selectedAlert?.id || 1),
    enabled: !!selectedAlert,
    retry: 2,
  });

  const {
    data: latencyData = []
  } = useQuery<LatencyDataPoint[]>({
    queryKey: ['latency', selectedAlert?.id],
    queryFn: () => mockApi.getLatencyData(selectedAlert?.id || 1, '24h'),
    enabled: !!selectedAlert,
    retry: 2,
  });

  const {
    data: logs = []
  } = useQuery<LogEntry[]>({
    queryKey: ['logs', selectedAlert?.id],
    queryFn: () => mockApi.getLogs(selectedAlert?.id || 1),
    enabled: !!selectedAlert,
    retry: 2,
  });

  const handleRefresh = () => {
    refetchAlerts();
    refetchMetrics();
    refetchTopErrors();
    setLastUpdated(new Date());
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseDrilldown = () => {
    setSelectedAlert(null);
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Transform data for components
  const funnelData = useMemo(() => transformFunnelData(metrics), [metrics]);
  const reliabilityData = useMemo(() => transformReliabilityMetrics(metrics), [metrics]);

  const hasErrors = alertsError || metricsError;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funnel Reliability Dashboard</h1>
            <p className="text-gray-600 mt-1">Phone Collection Step Monitoring</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm text-gray-500">
              Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`gap-2 ${autoRefresh ? 'bg-green-50 border-green-300' : ''}`}
            >
              {autoRefresh ? '✓ Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={metricsLoading || alertsLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(metricsLoading || alertsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {hasErrors && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
            <div className="text-red-600 text-xl">⚠</div>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-1">
                {alertsError ? 'Failed to load alerts. ' : ''}
                {metricsError ? 'Failed to load metrics. ' : ''}
                Please try refreshing the page.
              </p>
            </div>
          </div>
        )}

        {/* Funnel Overview */}
        <FunnelOverview data={funnelData} loading={metricsLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Reliability Metrics Table */}
            <ReliabilityMetrics data={reliabilityData} loading={metricsLoading} />

            {/* Trend Graphs */}
            <TrendGraphs loading={metricsLoading} />
          </div>

          {/* Alerts Panel */}
          <div>
            <AlertsPanel
              alerts={alerts}
              loading={alertsLoading}
              topErrors={topErrors}
              onAlertClick={handleAlertClick}
            />
          </div>
        </div>

        {/* ========== BEGIN: BUSINESS IMPACT LAYER INTEGRATION ========== */}
        {/* Business Impact Layer - Shows estimated business impact of reliability issues */}
        <BusinessImpactLayer loading={metricsLoading} />
        {/* ========== END: BUSINESS IMPACT LAYER INTEGRATION ========== */}

        {/* Health Summary Footer */}
        <HealthSummary
          reliabilityMetrics={reliabilityData}
          alerts={alerts}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Root Cause Drilldown Panel */}
      {selectedAlert && segmentation && (
        <RootCauseDrilldownPanel
          alert={selectedAlert}
          onClose={handleCloseDrilldown}
          timeRange="24h"
          rootCauseFactors={rootCauseFactors}
          segmentation={segmentation}
          latencyData={latencyData}
          logs={logs}
        />
      )}
    </div>
  );
}
