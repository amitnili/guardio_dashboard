import React, { useMemo } from "react";
import { X, ExternalLink, AlertTriangle, XCircle, Info, TrendingUp, Globe, Monitor, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";
import type { Alert, RootCauseFactor, SegmentationData, LatencyDataPoint, LogEntry } from "@/types/dashboard";

interface RootCauseDrilldownPanelProps {
  alert: Alert | null;
  onClose: () => void;
  timeRange: string;
  rootCauseFactors: RootCauseFactor[];
  segmentation: SegmentationData;
  latencyData: LatencyDataPoint[];
  logs: LogEntry[];
}

export default function RootCauseDrilldownPanel({
  alert,
  onClose,
  timeRange,
  rootCauseFactors,
  segmentation,
  latencyData,
  logs,
}: RootCauseDrilldownPanelProps) {
  if (!alert) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-6 h-6 text-red-200" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-orange-200" />;
      default:
        return <Info className="w-6 h-6 text-blue-200" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const formatLayerName = (layer: string) => {
    return layer
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCreateJiraTicket = () => {
    const businessImpact = alert.severity === "critical" ? "High - Service degradation affecting activations" : "Medium - Potential user experience impact";

    const jiraDescription = `
*Incident Details*
- *Name:* ${alert.message}
- *Severity:* ${alert.severity}
- *Affected Layer:* ${alert.related_layer ? formatLayerName(alert.related_layer) : "Unknown"}
- *Detected:* ${alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "Unknown"}
- *Time Range:* ${timeRange}

*Business Impact*
${businessImpact}

*Root Cause Analysis*
${rootCauseFactors.slice(0, 3).map((factor, idx) =>
  `${idx + 1}. [${factor.likelihood.toUpperCase()}] ${factor.cause}\n   Evidence: ${factor.evidence}`
).join('\n')}

*Related Logs*
${logs.slice(0, 5).map(log =>
  `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
).join('\n')}

*Action Required*
Please investigate and resolve the root cause to restore normal service operation.
    `.trim();

    // In a real implementation, this would call the Jira API
    // For now, we'll copy to clipboard and show an alert
    navigator.clipboard.writeText(jiraDescription).then(() => {
      alert("Jira ticket details copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy ticket details. Please copy manually.");
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-2 rounded shadow-lg border border-gray-200 text-xs">
        <p className="font-semibold text-gray-900">{payload[0].payload.time}</p>
        <p className="text-blue-600">Latency: {payload[0].value}ms</p>
      </div>
    );
  };

  const segmentationChartData = useMemo(() => {
    return {
      country: segmentation.country.map(c => ({
        name: c.name,
        affected: c.affected,
        total: c.total,
        rate: ((c.affected / c.total) * 100).toFixed(1)
      })),
      browser: segmentation.browser.map(b => ({
        name: b.name,
        affected: b.affected,
        total: b.total,
        rate: ((b.affected / b.total) * 100).toFixed(1)
      })),
      trafficSource: segmentation.trafficSource.map(t => ({
        name: t.name,
        affected: t.affected,
        total: t.total,
        rate: ((t.affected / t.total) * 100).toFixed(1)
      }))
    };
  }, [segmentation]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop overlay - click to close */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              {getSeverityIcon(alert.severity)}
              <div>
                <h2 className="text-2xl font-bold">Root Cause Analysis</h2>
                <p className="text-sm text-blue-100 mt-1">Detailed incident investigation</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-white text-blue-700 border-2 border-white hover:bg-blue-50 hover:border-blue-200 font-semibold px-4 py-2 transition-all flex items-center gap-2 shadow-md"
            >
              <X className="w-5 h-5" />
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-gray-50">
          {/* Incident Summary */}
          <Card className="shadow-md border-2 border-blue-100 bg-white">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Incident Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Name</h3>
                <p className="text-sm text-gray-900">{alert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Window</h3>
                  <p className="text-sm text-gray-600">
                    {alert.timestamp ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true }) : "Unknown"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Affected Layer</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {alert.related_layer ? formatLayerName(alert.related_layer) : "Unknown"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Severity</h3>
                  <Badge variant="outline" className={`border capitalize ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                  <Badge variant="outline" className={alert.is_resolved ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                    {alert.is_resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleCreateJiraTicket}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Create Jira Ticket
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Click to copy pre-filled ticket details to clipboard
              </p>
            </CardContent>
          </Card>

          {/* Root Cause Breakdown */}
          <Card className="shadow-md border-2 border-orange-100 bg-white">
            <CardHeader className="bg-orange-50 border-b border-orange-100">
              <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Root Cause Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Layer</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Possible Cause</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Likelihood</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Evidence</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Impact %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rootCauseFactors.map((factor, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                            {formatLayerName(factor.layer)}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-gray-900">{factor.cause}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={`text-xs capitalize border ${getLikelihoodColor(factor.likelihood)}`}>
                            {factor.likelihood}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-xs">{factor.evidence}</td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-900">{factor.impact}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Segmentation */}
          <Card className="shadow-md border-2 border-purple-100 bg-white">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Segmentation Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    By Country
                  </h3>
                  <div className="space-y-2">
                    {segmentationChartData.country.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.affected}/{item.total}</span>
                          <span className="font-semibold text-red-600">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browser */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-500" />
                    By Browser
                  </h3>
                  <div className="space-y-2">
                    {segmentationChartData.browser.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.affected}/{item.total}</span>
                          <span className="font-semibold text-red-600">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Source */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-green-500" />
                    By Traffic Source
                  </h3>
                  <div className="space-y-2">
                    {segmentationChartData.trafficSource.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.affected}/{item.total}</span>
                          <span className="font-semibold text-red-600">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latency Chart */}
          <Card className="shadow-md border-2 border-green-100 bg-white">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Latency During Incident
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="time"
                    stroke="#6B7280"
                    fontSize={11}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={11}
                    tickMargin={8}
                    label={{ value: 'ms', position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={latencyData[0]?.threshold || 800}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                    label={{ value: 'Threshold', position: 'right', fill: '#EF4444', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Logs Preview */}
          <Card className="shadow-md border-2 border-gray-300 bg-white">
            <CardHeader className="bg-gray-100 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                    <span className={`font-semibold uppercase flex-shrink-0 ${getLogLevelStyle(log.level)}`}>
                      [{log.level}]
                    </span>
                    <span className="text-blue-400 flex-shrink-0">{log.service}:</span>
                    <span className="text-gray-100">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
