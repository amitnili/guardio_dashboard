import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReliabilityMetric } from "@/types/dashboard";
import { getFallbackReliabilityMetrics } from "@/utils/dashboardData";

interface ReliabilityMetricsProps {
  data?: ReliabilityMetric[];
  loading: boolean;
}

export default function ReliabilityMetrics({ data, loading }: ReliabilityMetricsProps) {
  const metricsData = data && data.length > 0 ? data : getFallbackReliabilityMetrics();
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

  const getMetricTooltip = (layer: string): string => {
    const tooltips: Record<string, string> = {
      "Client": "Percentage of users who received a system response within 2 seconds.",
      "Server": "Percentage of backend phone validation requests successfully processed, including retries.",
      "Provider": "In the last hour, ~15% of phone validation API requests failed due to provider instability.",
      "Data Quality": "Percentage of tracking events successfully recorded without delay or duplication."
    };
    return tooltips[layer] || "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: "bg-green-50 text-green-700 border-green-200",
      warning: "bg-orange-50 text-orange-700 border-orange-200",
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getLayerColor = (layer: string) => {
    const colors: Record<string, string> = {
      "Client": "bg-blue-50 text-blue-700 border-blue-200",
      "Server": "bg-purple-50 text-purple-700 border-purple-200",
      "Provider": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Data Quality": "bg-green-50 text-green-700 border-green-200"
    };
    return colors[layer] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Reliability Metrics by Layer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Layer</TableHead>
                <TableHead className="font-semibold text-gray-700">Metric</TableHead>
                <TableHead className="font-semibold text-gray-700">Target</TableHead>
                <TableHead className="font-semibold text-gray-700">Current</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No metrics data available
                  </TableCell>
                </TableRow>
              ) : (
                metricsData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className={`${getLayerColor(item.layer)} border font-medium`}>
                        {item.layer}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>{item.metric}</span>
                        <div
                          className="relative inline-flex"
                          onMouseEnter={() => setHoveredMetric(index)}
                          onMouseLeave={() => setHoveredMetric(null)}
                        >
                          <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                          {hoveredMetric === index && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                              {getMetricTooltip(item.layer)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{item.target}</TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {item.current}{item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge
                          variant="outline"
                          className={`${getStatusBadge(item.status)} border font-medium capitalize`}
                        >
                          {item.status}
                        </Badge>
                        {getStatusIcon(item.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
