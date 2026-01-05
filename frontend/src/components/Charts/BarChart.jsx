// Bar chart component - displays data in bar format
// Used for comparisons and distributions

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({ 
  data, 
  dataKey, 
  xAxisKey = 'name',
  bars = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  className = ''
}) => {
  // Default bar if none provided
  const defaultBars = bars.length > 0 ? bars : [
    { dataKey, fill: '#3B82F6', name: dataKey }
  ];

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {defaultBars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={bar.radius || [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
