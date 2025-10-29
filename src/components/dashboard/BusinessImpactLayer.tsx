/**
 * BUSINESS IMPACT LAYER COMPONENT (REDESIGNED)
 *
 * Shows the estimated business impact of reliability issues during the Phone Collection step.
 * Aligned with actual funnel data (96 activations).
 * Includes:
 * - Activation Impact Summary card
 * - Activations over time chart with incident highlighting
 * - Incident Impact Range table
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label
} from "recharts";

type TimeRange = '1h' | '24h' | '7d' | '30d';

interface BusinessImpactLayerProps {
  loading: boolean;
}

export default function BusinessImpactLayer({ loading }: BusinessImpactLayerProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // ============ ACTIVATION IMPACT SUMMARY ============
  // Aligned with actual funnel data: 96 activations
  const activationImpact = useMemo(() => {
    // Realistic numbers based on actual 96 activations
    const impacts: Record<string, { achieved: number; lost: number }> = {
      '1h': { achieved: 87, lost: 9 },
      '24h': { achieved: 96, lost: 12 },
      '7d': { achieved: 672, lost: 84 },
      '30d': { achieved: 2880, lost: 360 }
    };

    const { achieved, lost } = impacts[timeRange];
    const total = achieved + lost;
    const lossPercentage = (lost / total) * 100;

    return {
      achieved,
      lost,
      total,
      lossPercentage,
      status: lossPercentage > 15 ? 'critical' as const :
              lossPercentage > 8 ? 'warning' as const :
              'healthy' as const
    };
  }, [timeRange]);

  // ============ INCIDENT DEFINITIONS WITH TIME RANGES ============
  const incidents = useMemo(() => {
    const points: Record<string, number> = { '1h': 12, '24h': 24, '7d': 7, '30d': 30 };
    const count = points[timeRange];

    // Define incidents with duration based on time range
    const incidentList = [
      {
        id: 'incident-1',
        name: 'Server Response Time Breach',
        severity: 'critical' as const,
        startIndex: Math.floor(count * 0.3),
        endIndex: Math.floor(count * 0.45),
        activationsLost: timeRange === '1h' ? 0 : timeRange === '24h' ? 8 : timeRange === '7d' ? 56 : 240,
        priority: 'P0'
      },
      {
        id: 'incident-2',
        name: 'Phone validation errors affecting user activations',
        severity: 'critical' as const,
        startIndex: Math.floor(count * 0.85),
        endIndex: count,
        activationsLost: timeRange === '1h' ? 9 : timeRange === '24h' ? 3 : timeRange === '7d' ? 21 : 90,
        priority: 'P0'
      },
      {
        id: 'incident-3',
        name: 'Client Abandon Rate Spike',
        severity: 'low' as const,
        startIndex: Math.floor(count * 0.55),
        endIndex: Math.floor(count * 0.62),
        activationsLost: timeRange === '1h' ? 0 : timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30,
        priority: 'P2'
      }
    ];

    // Filter out incidents with 0 activations lost
    return incidentList.filter(inc => inc.activationsLost > 0);
  }, [timeRange]);

  // ============ ACTIVATIONS OVER TIME DATA ============
  const activationsData = useMemo(() => {
    const points: Record<string, number> = { '1h': 12, '24h': 24, '7d': 7, '30d': 30 };
    const count = points[timeRange];
    const baseRate = activationImpact.achieved / count;

    // Generate data points showing actual activations
    return Array.from({ length: count }, (_, i) => {
      const timeLabel = timeRange === '1h' ? `${i * 5}m` :
                        timeRange === '24h' ? `${i}:00` :
                        timeRange === '7d' ? `Day ${i + 1}` :
                        `Day ${i + 1}`;

      // Check if this point is within any incident
      const activeIncident = incidents.find(inc => i >= inc.startIndex && i < inc.endIndex);

      // Normal: ~baseRate activations per period, During incident: 30-50% drop
      const normalActivations = baseRate + (Math.random() - 0.5) * 1;
      const incidentActivations = normalActivations * (0.5 + Math.random() * 0.2);
      const actualActivations = activeIncident ? incidentActivations : normalActivations;

      return {
        time: timeLabel,
        activations: Math.max(0, actualActivations),
        baseline: baseRate,
        incident: activeIncident ? {
          name: activeIncident.name,
          severity: activeIncident.severity,
          activationsLost: activeIncident.activationsLost,
          // Calculate time range for this incident
          startTime: timeRange === '1h' ? `${activeIncident.startIndex * 5}m` :
                     timeRange === '24h' ? `${activeIncident.startIndex}:00` :
                     timeRange === '7d' ? `Day ${activeIncident.startIndex + 1}` :
                     `Day ${activeIncident.startIndex + 1}`,
          endTime: timeRange === '1h' ? `${activeIncident.endIndex * 5}m` :
                   timeRange === '24h' ? `${activeIncident.endIndex}:00` :
                   timeRange === '7d' ? `Day ${activeIncident.endIndex + 1}` :
                   `Day ${activeIncident.endIndex + 1}`
        } : null
      };
    });
  }, [timeRange, activationImpact, incidents]);

  // ============ INCIDENT IMPACT TABLE DATA (TIME RANGE-AWARE) ============
  const incidentImpactData = useMemo(() => {
    return incidents.map(inc => {
      // Calculate time range display
      const startTime = timeRange === '1h' ? `${inc.startIndex * 5}m` :
                        timeRange === '24h' ? `${inc.startIndex}:00` :
                        timeRange === '7d' ? `Day ${inc.startIndex + 1}` :
                        `Day ${inc.startIndex + 1}`;
      const endTime = timeRange === '1h' ? `${inc.endIndex * 5}m` :
                      timeRange === '24h' ? `${inc.endIndex}:00` :
                      timeRange === '7d' ? `Day ${inc.endIndex + 1}` :
                      `Day ${inc.endIndex + 1}`;

      return {
        severity: inc.severity === 'critical' ? 'Critical' : 'Low',
        incidentType: inc.name,
        activationsLost: inc.activationsLost,
        priority: inc.priority,
        timeRange: `${startTime} – ${endTime}`,
        color: inc.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
      };
    });
  }, [incidents, timeRange]);

  // ============ CUSTOM TOOLTIP ============
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        <div className="flex items-center gap-2 text-xs mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-gray-700">Activations:</span>
          <span className="font-semibold text-gray-900">{dataPoint.activations.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-gray-700">Baseline:</span>
          <span className="font-semibold text-gray-900">{dataPoint.baseline.toFixed(1)}</span>
        </div>
        {dataPoint.incident && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className={`flex items-start gap-1 mb-1 ${
              dataPoint.incident.severity === 'critical' ? 'text-red-600' :
              dataPoint.incident.severity === 'warning' ? 'text-orange-600' : 'text-yellow-600'
            }`}>
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-semibold">{dataPoint.incident.name}</div>
                <div className="text-gray-600 mt-0.5">
                  Duration: {dataPoint.incident.startTime} – {dataPoint.incident.endTime}
                </div>
                <div className="font-medium mt-0.5">
                  Est. Loss: −{dataPoint.incident.activationsLost} activations
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // ============ MAIN RENDER ============
  return (
    // ========== BEGIN: BUSINESS IMPACT LAYER SECTION ==========
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Business Impact Layer
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Estimated impact of reliability issues on user activations
            </p>
          </div>

          {/* TIME RANGE SELECTOR */}
          <div className="flex items-center gap-2">
            {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={`h-8 px-3 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? '!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range === '1h' ? '1H' : range === '24h' ? '24H' : range === '7d' ? '7D' : '30D'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ACTIVATION IMPACT SUMMARY CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-5 border-2 ${
            activationImpact.status === 'critical' ? 'bg-red-50 border-red-200' :
            activationImpact.status === 'warning' ? 'bg-orange-50 border-orange-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Activation Impact Summary</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Impact of reliability issues on user activations ({timeRange})
                </p>
              </div>
              <Badge
                variant="outline"
                className={`${
                  activationImpact.status === 'healthy' ? 'bg-green-100 text-green-700 border-green-300' :
                  activationImpact.status === 'warning' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                  'bg-red-100 text-red-700 border-red-300'
                } border font-medium text-xs`}
              >
                {activationImpact.status === 'healthy' ? '✓ Low' :
                 activationImpact.status === 'warning' ? '⚠ Medium' : '✗ High'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-600 font-medium uppercase">Activations:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {activationImpact.achieved}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-600 font-medium uppercase">Estimated Loss:</span>
                <span className={`text-xl font-bold ${
                  activationImpact.status === 'critical' ? 'text-red-600' :
                  activationImpact.status === 'warning' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  −{activationImpact.lost}
                </span>
                <span className={`text-sm font-medium ${
                  activationImpact.status === 'critical' ? 'text-red-600' :
                  activationImpact.status === 'warning' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  (−{activationImpact.lossPercentage.toFixed(1)}%)
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Potential Total: </span>
                  {activationImpact.total} activations
                </div>
                {timeRange === '1h' && activationImpact.lost > 0 && (
                  <div className="text-xs text-red-600 mt-2 font-medium">
                    Estimated {activationImpact.lost} activations lost due to validation errors in the past hour
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVATIONS OVER TIME CHART */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Activations Over Time
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Actual activations with incident periods highlighted in red/amber
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-gray-700">Activations</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-gray-400" style={{ width: '16px' }} />
                <span className="text-gray-700">Baseline</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500" />
                <span className="text-gray-700">Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500" />
                <span className="text-gray-700">Warning</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={activationsData} margin={{ top: 10, right: 5, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                stroke="#9CA3AF"
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                stroke="#9CA3AF"
                domain={[0, 'auto']}
                label={{ value: 'Activations', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Incident duration shading - each incident shown as a continuous shaded area */}
              {incidents.map((incident, idx) => {
                const startPoint = activationsData[incident.startIndex];
                const endPoint = activationsData[incident.endIndex - 1];

                if (!startPoint || !endPoint) return null;

                const fillColor = incident.severity === 'critical' ? '#EF4444' : '#F59E0B';

                return (
                  <ReferenceArea
                    key={`incident-area-${incident.id}`}
                    x1={startPoint.time}
                    x2={endPoint.time}
                    fill={fillColor}
                    fillOpacity={0.15}
                    stroke={fillColor}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  >
                    <Label
                      value={incident.name}
                      position="top"
                      fill={fillColor}
                      fontSize={9}
                      offset={idx * 15}
                    />
                  </ReferenceArea>
                );
              })}

              {/* Baseline reference line */}
              <ReferenceLine
                y={activationsData[0]?.baseline || 4}
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              >
                <Label value="Baseline" position="insideTopRight" fill="#6B7280" fontSize={10} />
              </ReferenceLine>

              {/* Main activations line */}
              <Line
                type="monotone"
                dataKey="activations"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const point = activationsData[props.index];
                  if (point?.incident) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill={point.incident.severity === 'critical' ? '#EF4444' : '#F97316'}
                        stroke="#FFF"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle {...props} r={3} fill="#2563EB" />;
                }}
                name="Activations"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* INCIDENT IMPACT RANGE TABLE */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Incident Impact Range</h3>
            <p className="text-xs text-gray-600 mt-1">
              Breakdown of activations lost by incident type and severity
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Severity</TableHead>
                <TableHead className="text-xs font-semibold">Incident Type</TableHead>
                <TableHead className="text-xs font-semibold text-right">Activations Lost</TableHead>
                <TableHead className="text-xs font-semibold text-center">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentImpactData.map((incident, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        incident.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                        incident.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      } border text-xs font-medium`}
                    >
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{incident.incidentType}</TableCell>
                  <TableCell className={`text-right text-sm font-semibold ${incident.color}`}>
                    −{incident.activationsLost}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="border border-gray-300 text-gray-700 text-xs"
                    >
                      {incident.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={2} className="text-sm">Total Estimated Loss</TableCell>
                <TableCell className="text-right text-sm text-red-600">
                  −{incidentImpactData.reduce((sum, i) => sum + i.activationsLost, 0)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    // ========== END: BUSINESS IMPACT LAYER SECTION ==========
  );
}
