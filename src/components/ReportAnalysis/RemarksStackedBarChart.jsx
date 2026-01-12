import React, { useRef } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LabelList } from 'recharts';

const COLORS = {
  total: '#2563EB',     
  connected: '#22C55E', 
  percentage: '#F97316', 
};

function RemarksStackedBarChart({ data }) {
  const chartRef = useRef(null);



  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Remarks Analysis Statistics</h3>
       
      </div>
      <div ref={chartRef} className="bg-white p-4">
       
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 30, right: 40, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{
                fontSize: 12,
                fill: '#6B7280',
                fontWeight: 500,
              }}
              interval={0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: COLORS.percentage, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value, name) => [value, name === 'Other' ? 'Not Connected' : name]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey={(d) => d.totalRemarks - d.connectedRemarks}
              fill={COLORS.total}
              name="Not Connected"
              stackId="remarks"
              barSize={38}
            >
              <LabelList
                dataKey={(d) => d.totalRemarks - d.connectedRemarks}
                position="top"
                fill={COLORS.total}
                fontWeight={600}
              />
            </Bar>
            <Bar
              yAxisId="left"
              dataKey="connectedRemarks"
              fill={COLORS.connected}
              name="Connected"
              stackId="remarks"
              barSize={38}
            >
              <LabelList dataKey="connectedRemarks" position="top" fill={COLORS.connected} fontWeight={600} />
            </Bar>
            <Line
  yAxisId="right"
  type="linear"  // ✅ Changed from "monotone" to "linear" for straight lines
  dataKey="percentage"
  name="Connect %"
  stroke={COLORS.percentage}
  strokeWidth={3}
  dot={{ r: 6, fill: COLORS.percentage }}
  activeDot={{ r: 8 }}
  label={({ x, y, value }) => (
    <text x={x} y={y - 8} fontSize={12} fill={COLORS.percentage} textAnchor="middle">
      {`${value}%`}
    </text>
  )}
/>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RemarksStackedBarChart;
