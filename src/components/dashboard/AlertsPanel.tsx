import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Info, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import TopErrorsWidget from "./TopErrorsWidget";
import type { Alert, TopError } from "@/types/dashboard";

interface AlertsPanelProps {
  alerts: Alert[];
  loading: boolean;
  topErrors: TopError[];
  onAlertClick?: (alert: Alert) => void;
  onAlertDelete?: (alertId: number) => void;
}

export default function AlertsPanel({ alerts, loading, topErrors, onAlertClick, onAlertDelete }: AlertsPanelProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 hover:border-red-300";
      case "warning":
        return "bg-orange-50 border-orange-200 hover:border-orange-300";
      case "info":
        return "bg-blue-50 border-blue-200 hover:border-blue-300";
      default:
        return "bg-gray-50 border-gray-200 hover:border-gray-300";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerts Panel */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Real-time Alerts</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
              {alerts.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active alerts
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 transition-all relative ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onAlertClick && onAlertClick(alert)}
                    >
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`${getSeverityBadge(alert.severity)} border text-xs font-medium capitalize`}>
                          {alert.severity}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(alert.timestamp || alert.created_date || new Date()), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {deleteConfirmId === alert.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (alert.id !== undefined) {
                                onAlertDelete && onAlertDelete(alert.id);
                              }
                              setDeleteConfirmId(null);
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-100 border border-red-300 hover:bg-red-50 transition-all shadow-sm text-red-600 hover:text-red-700 font-bold text-lg"
                          title="Delete Alert"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (alert.id !== undefined) {
                              setDeleteConfirmId(alert.id);
                            }
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Errors Widget */}
      <TopErrorsWidget topErrors={topErrors} loading={loading} />
    </div>
  );
}
