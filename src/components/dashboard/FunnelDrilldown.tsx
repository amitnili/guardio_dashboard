import { X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyConversionData } from "@/types/dashboard";

interface FunnelDrilldownProps {
  stage: string;
  data: DailyConversionData[];
  color: string;
  onClose: () => void;
}

export default function FunnelDrilldown({ stage, data, color, onClose }: FunnelDrilldownProps) {
  // Extract RGB values from Tailwind color classes
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-indigo-500': '#6366F1',
    'bg-purple-500': '#A855F7',
    'bg-green-500': '#10B981',
  };

  const chartColor = colorMap[color] || '#3B82F6';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.day}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
          <p className="text-sm font-bold mt-1" style={{ color: chartColor }}>
            {payload[0].value}% conversion
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{stage} - 7-Day Conversion Trend</h4>
          <p className="text-xs text-gray-500 mt-1">Daily conversion rate over the past week</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
          aria-label="Close chart"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="conversionRate"
              stroke={chartColor}
              strokeWidth={3}
              dot={{ fill: chartColor, r: 4 }}
              activeDot={{ r: 6, fill: chartColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
