import { FunnelMetrics, FunnelStage, ReliabilityMetric } from '../types/dashboard.js';

export const transformFunnelData = (metrics: FunnelMetrics[]): FunnelStage[] => {
  const funnelMetrics = metrics.filter(m => m.funnel_stage);

  if (funnelMetrics.length === 0) {
    return getFallbackFunnelData();
  }

  const stageOrder = ['visitors', 'next_page', 'phone_collected', 'activation'];
  const stageColors = {
    visitors: 'bg-blue-500',
    next_page: 'bg-indigo-500',
    phone_collected: 'bg-purple-500',
    activation: 'bg-violet-500'
  };

  const stageNames = {
    visitors: 'Visitors',
    next_page: 'Next Page',
    phone_collected: 'Phone Collected',
    activation: 'Activation'
  };

  return stageOrder.map(stage => {
    const metric = funnelMetrics.find(m => m.funnel_stage === stage);
    return {
      stage: stageNames[stage as keyof typeof stageNames] || stage,
      count: metric?.current_value || 0,
      conversion: metric?.conversion_rate || 0,
      dropOff: metric?.drop_off_rate || 0,
      delta: metric?.comparison_delta || 0,
      color: stageColors[stage as keyof typeof stageColors] || 'bg-gray-500'
    };
  });
};

export const transformReliabilityMetrics = (metrics: FunnelMetrics[]): ReliabilityMetric[] => {
  const layerMetrics = metrics.filter(m => m.layer && m.metric_name);

  if (layerMetrics.length === 0) {
    return getFallbackReliabilityMetrics();
  }

  return layerMetrics.map(m => ({
    layer: formatLayerName(m.layer || ''),
    metric: m.metric_name || '',
    target: m.target_value || '',
    current: m.current_value || 0,
    unit: m.unit || '',
    status: m.status || 'healthy'
  }));
};

const formatLayerName = (layer: string): string => {
  return layer
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getFallbackFunnelData = (): FunnelStage[] => [
  { stage: "Visitors", count: 10000, conversion: 100, dropOff: 0, delta: 0, color: "bg-blue-500" },
  { stage: "Next Page", count: 7500, conversion: 75, dropOff: 25, delta: -2.3, color: "bg-indigo-500" },
  { stage: "Phone Collected", count: 5400, conversion: 72, dropOff: 28, delta: -3.8, color: "bg-purple-500" },
  { stage: "Activation", count: 4860, conversion: 90, dropOff: 10, delta: 1.2, color: "bg-violet-500" },
];

export const getFallbackReliabilityMetrics = (): ReliabilityMetric[] => [
  { layer: "Client", metric: "User Response Success", target: "≥ 95%", current: 92.5, unit: "%", status: "warning" },
  { layer: "Server", metric: "Validation Request Success Rate", target: "≥ 98%", current: 96.5, unit: "%", status: "warning" },
  { layer: "Provider", metric: "Phone Validation Error Rate", target: "< 3%", current: 15.0, unit: "%", status: "critical" },
  { layer: "Data Quality", metric: "Event Completeness & Accuracy", target: "≥ 99.5%", current: 99.8, unit: "%", status: "healthy" }
];
