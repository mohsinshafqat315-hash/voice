// Secondary button component - secondary action button
// Used for cancel, back, secondary actions

const SecondaryButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  loading = false,
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        px-4 py-2
        font-medium text-sm
        rounded-md
        focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${variants[variant] || variants.default}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default SecondaryButton;
