import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";
import type { TopError } from "@/types/dashboard";

interface TopErrorsWidgetProps {
  topErrors: TopError[];
  loading?: boolean;
}

export default function TopErrorsWidget({ topErrors, loading }: TopErrorsWidgetProps) {
  const getLayerColor = (layer: string) => {
    switch (layer) {
      case "client":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "server":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "provider":
        return "bg-green-100 text-green-700 border-green-200";
      case "data_quality":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatLayerName = (layer: string) => {
    return layer
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-gray-200 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            Top 4 Most Common Errors (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          Top 4 Most Common Errors (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topErrors.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No errors recorded in the last 24 hours
          </div>
        ) : (
          <div className="space-y-2">
            {topErrors.slice(0, 4).map((error, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {error.message}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium border ${getLayerColor(error.layer)}`}
                >
                  {formatLayerName(error.layer)}
                </Badge>
                <div className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded border border-gray-300 min-w-[40px] text-center">
                  {error.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
