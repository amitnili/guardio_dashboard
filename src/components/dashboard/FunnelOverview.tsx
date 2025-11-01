import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { FunnelStage, DailyConversionData } from "@/types/dashboard";
import { getFallbackFunnelData } from "@/utils/dashboardData";
import { mockApi } from "@/api/mockApi";
import FunnelDrilldown from "./FunnelDrilldown";

interface FunnelOverviewProps {
  data?: FunnelStage[];
  loading: boolean;
}

export default function FunnelOverview({ data, loading }: FunnelOverviewProps) {
  const funnelData = data && data.length > 0 ? data : getFallbackFunnelData();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Fetch daily conversion data when a stage is selected
  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyConversionData[]>({
    queryKey: ['dailyConversion', selectedStage],
    queryFn: () => mockApi.getDailyConversionHistory(selectedStage || ''),
    enabled: !!selectedStage,
    retry: 1,
  });

  const handleStageClick = (stage: string) => {
    setSelectedStage(selectedStage === stage ? null : stage);
  };

  const handleCloseDrilldown = () => {
    setSelectedStage(null);
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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
        <CardTitle className="text-xl font-semibold text-gray-900">Funnel Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {funnelData.map((stage, index) => (
              <React.Fragment key={stage.stage}>
                <div className="flex-1 min-w-0">
                  <div
                    onClick={() => handleStageClick(stage.stage)}
                    className={`${stage.color} rounded-lg p-4 sm:p-6 text-white relative overflow-hidden transition-all cursor-pointer ${
                      selectedStage === stage.stage
                        ? 'scale-105 ring-4 ring-white shadow-xl'
                        : 'hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-sm font-medium opacity-90">{stage.stage}</div>
                      <div className="text-2xl font-bold mt-1">
                        {stage.count.toLocaleString()}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-between text-xs">
                          <span>Conversion</span>
                          <span className="font-semibold">{stage.conversion.toFixed(1)}%</span>
                        </div>
                        {stage.dropOff > 0 && (
                          <div className="flex items-center justify-between text-xs mt-1 opacity-80">
                            <span>Drop-off</span>
                            <span>{stage.dropOff.toFixed(1)}%</span>
                          </div>
                        )}
                        {stage.delta !== 0 && (
                          <div className={`flex items-center gap-1 text-xs mt-2 ${
                            stage.delta > 0 ? 'text-green-200' : 'text-red-200'
                          }`}>
                            {stage.delta > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="font-medium">
                              {stage.delta > 0 ? '+' : ''}{stage.delta.toFixed(1)}% vs last week
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < funnelData.length - 1 && (
                  <ArrowRight className="hidden sm:block w-5 h-5 text-gray-400 flex-shrink-0 -mx-3 z-10" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Drilldown Chart */}
          {selectedStage && dailyData && !dailyLoading && (
            <FunnelDrilldown
              stage={selectedStage}
              data={dailyData}
              color={funnelData.find(s => s.stage === selectedStage)?.color || 'bg-blue-500'}
              onClose={handleCloseDrilldown}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
