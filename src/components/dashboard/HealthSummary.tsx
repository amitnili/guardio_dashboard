import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import type { Alert, ReliabilityMetric } from "@/types/dashboard";

interface HealthSummaryProps {
  reliabilityMetrics?: ReliabilityMetric[];
  alerts: Alert[];
  lastUpdated: Date;
}

export default function HealthSummary({ reliabilityMetrics = [], alerts, lastUpdated }: HealthSummaryProps) {
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;
  const criticalMetrics = reliabilityMetrics.filter(m => m.status === "critical").length;

  const getHealthStatus = () => {
    if (criticalCount >= 2 || criticalMetrics >= 2) {
      return {
        status: "Critical",
        icon: "🔴",
        message: "Multiple critical issues detected – Immediate action required",
        color: "bg-red-50 border-red-300 text-red-900"
      };
    } else if (criticalCount >= 1 || criticalMetrics >= 1 || warningCount >= 2) {
      return {
        status: "At Risk",
        icon: "🟠",
        message: "Investigate Server Latency and Client Drop-offs",
        color: "bg-orange-50 border-orange-300 text-orange-900"
      };
    } else {
      return {
        status: "Healthy",
        icon: "🟢",
        message: "All systems operating within normal parameters",
        color: "bg-green-50 border-green-300 text-green-900"
      };
    }
  };

  const health = getHealthStatus();

  return (
    <Card className={`shadow-sm border-2 ${health.color} transition-all`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl" role="img" aria-label={health.status}>
              {health.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Overall Funnel Health:</span>
                <span className="text-lg font-bold">{health.status}</span>
              </div>
              <p className="text-sm mt-1 font-medium">{health.message}</p>
              {(criticalCount > 0 || warningCount > 0) && (
                <p className="text-xs mt-1 opacity-75">
                  {criticalCount} critical, {warningCount} warnings
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last updated: {format(lastUpdated, 'MMM d, yyyy HH:mm:ss')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
