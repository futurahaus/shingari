import React from 'react';
import * as FaIcons from 'react-icons/fa';

interface ButtonProps {
  onPress: () => void;
  type: 'primary' | 'secondary';
  text: string;
  testID: string;
  icon?: keyof typeof FaIcons;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  type,
  text,
  testID,
  icon,
}) => {
  const baseClasses = "px-6 py-3 rounded-[10px] font-medium text-base text-center min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer w-full";
  
  const primaryClasses = "bg-[#EA3D15] text-white hover:bg-[#c53211] focus:ring-[#EA3D15] shadow-md";
  const secondaryClasses = "bg-transparent text-[#363F45] border border-[#363F45] hover:bg-gray-100 focus:ring-[#363F45]";
  
  const buttonClasses = type === 'primary' 
    ? `${baseClasses} ${primaryClasses}`
    : `${baseClasses} ${secondaryClasses}`;

  const IconComponent = icon ? FaIcons[icon] : null;

  return (
    <button
      className={buttonClasses}
      onClick={onPress}
      data-testid={testID}
    >
      {IconComponent && <IconComponent size={16} />}
      {text}
    </button>
  );
}; 