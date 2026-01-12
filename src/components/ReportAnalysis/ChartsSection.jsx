import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Loader2, TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#06B6D4', '#84CC16', '#F43F5E', '#6366F1'
];

const ChartsSection = ({ activeTab, loading, statsFilter, chartData, getStatsFilterOptions, leadSubTab }) => {
 const getChartTitle = () => {
  if (statsFilter[activeTab] === 'roleL2') return 'L2 Counsellor Statistics';
  if (statsFilter[activeTab] === 'roleL3') return 'L3 Counsellor Statistics';
       
  switch (activeTab) {
    case 'admission': return 'Admission Status Statistics';
    case 'application': return 'College Application Statistics';
    case 'lead': 
      return leadSubTab === 'api' 
        ? 'API Response Statistics' 
        : `Form Filled Statistics (By ${leadSubTab.charAt(0).toUpperCase() + leadSubTab.slice(1)})`;
    case 'remarks': return 'Remarks Analysis Statistics';
    default: return 'Data Statistics';
  }
};

 const getChartSubtitle = () => {
  switch (activeTab) {
    case 'admission': return 'Track admission progress across different statuses';
    case 'application': return 'Monitor application submissions by college';
    case 'lead': 
      return leadSubTab === 'api' 
        ? 'Analyze API response patterns and success rates' 
        : `View form filled metrics grouped by ${leadSubTab}`;
    case 'remarks': return 'Review counsellor activity and engagement metrics';
    default: return 'Comprehensive data analysis and insights';
  }
};

  const getChartIcon = () => {
    switch (activeTab) {
      case 'admission': return Activity;
      case 'application': return BarChart3;
      case 'lead': return TrendingUp;
      case 'remarks': return Activity;
      default: return BarChart3;
    }
  };

  const ChartIcon = getChartIcon();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>

          {activeTab === 'lead' && leadSubTab !== 'api' ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Total Leads:</span>
                <span className="font-medium text-right">{data.lead_count}</span>
                <span className="text-gray-600">Attempted:</span>
                <span className="font-medium text-right">{data.attempted}</span>
                <span className="text-gray-600">Form Filled:</span>
                <span className="font-medium text-right">{data.value}</span>
                <span className="text-gray-600">Admissions:</span>
                <span className="font-medium text-right">{data.admission}</span>
                <span className="text-gray-600">Lead to Form:</span>
                <span className="font-medium text-right">{data.leadToForm}%</span>
                <span className="text-gray-600">Form to Admission:</span>
                <span className="font-medium text-right">{data.formToAdmission}%</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: payload[0].color }}
              />
              <span className="text-sm text-gray-600">Count:</span>
              <span className="font-bold text-gray-900">{payload[0].value}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...chartData.map(item => item.value));
  var totalChartsdata=chartData;
  if(activeTab=='lead' && ['created_at','source','agent','campaign'].includes(leadSubTab))
  {
    totalChartsdata=chartData.slice(1,chartData.length)
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {getChartTitle()}
              </h3>
              <p className="text-sm text-gray-600">
                {getChartSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {getStatsFilterOptions().find(opt => opt.value === statsFilter[activeTab])?.label}
            </div>
            {!loading && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Total: <span className="font-semibold text-gray-900">{totalCount}</span></span>
                <span>Max: <span className="font-semibold text-gray-900">{maxValue}</span></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading chart data...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we process your data</p>
          </div>
        ) : totalChartsdata.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No data available</h4>
            <p className="text-sm text-center max-w-md">
              There's no data to display for the current selection. Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={totalChartsdata}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{
                    fontSize: 12,
                    fill: '#6B7280',
                    fontWeight: 500
                  }}
                  interval={0}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: '#6B7280',
                    fontWeight: 500
                  }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  fill="url(#barGradient)"
                >
                  {totalChartsdata.map((entry, index) => (
                    <rect
                      key={`bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-gray-200">
              {chartData.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {item.name}
                  </span>
                </div>
              ))}
              {totalChartsdata.length > 8 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-sm text-gray-500">
                    +{totalChartsdata.length - 8} more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;