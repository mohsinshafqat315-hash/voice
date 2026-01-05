// Statistics card component - displays key metrics
// Used in dashboard for totals, averages, counts

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  className = '',
  onClick 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow p-6
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trendColors[trend.direction] || trendColors.neutral}`}>
              {trend.direction === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
