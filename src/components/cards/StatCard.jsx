import React from "react";

const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle,
  onClick,
  className = "",
  height = "h-[108px]",
  background = "bg-[url('/small-frame.png')]",
  titleStyle = "text-body-2-pixelify",
  valueStyle = "text-heading-4-alagard",
  layout = "vertical",
  disabled = false,
  badge,
  customContent
}) => {
  const isClickable = onClick && !disabled;
  
  return (
    <div 
      className={`relative p-8 flex w-full ${height} ${isClickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className={`absolute inset-0 ${background} bg-no-repeat bg-cover pointer-events-none`} />
      <div className="relative z-10 flex justify-center items-center w-full h-full">
        {customContent ? (
          customContent
        ) : (
          <div className={`flex ${layout === 'horizontal' ? 'flex-row items-center gap-4' : 'flex-col gap-2 items-center'}`}>
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className={`flex flex-col ${layout === 'horizontal' ? 'items-start' : 'items-center'} gap-1`}>
              <p className={titleStyle}>{title}</p>
              <p className={`${valueStyle} ${disabled ? 'opacity-50' : ''}`}>{value}</p>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
            {badge && <div className="absolute top-2 right-2">{badge}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
