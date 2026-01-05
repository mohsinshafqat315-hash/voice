// Line chart component - displays data in line format
// Used for trends over time

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChart = ({ 
  data, 
  dataKey, 
  xAxisKey = 'name',
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  className = ''
}) => {
  // Default line if none provided
  const defaultLines = lines.length > 0 ? lines : [
    { dataKey, stroke: '#3B82F6', name: dataKey, strokeWidth: 2 }
  ];

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {defaultLines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== false}
              activeDot={line.activeDot || { r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
