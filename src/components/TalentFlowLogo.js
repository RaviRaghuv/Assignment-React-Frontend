const TalentFlowLogo = ({ size = 'default', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    default: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image */}
      <div className={`relative ${sizeClasses[size]}`}>
      <Link to="/app/dashboard">
        <img 
          src="/logo.png"   // Put your uploaded logo in the `public` folder
          alt="TalentFlow Logo"
          className="w-full h-full object-contain"
        />
        </Link>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`ml-3 font-bold text-gray-900 ${textSizes[size]} tracking-tight`}>
          TalentFlow
        </span>
      )}
    </div>
  );
};

export default TalentFlowLogo;
