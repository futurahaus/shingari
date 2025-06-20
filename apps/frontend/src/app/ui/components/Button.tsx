import React from 'react';
import * as FaIcons from 'react-icons/fa';
import { colors } from '../colors';
import { Text } from './Text';

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
  
  const primaryClasses = `bg-[${colors.primary.main}] hover:bg-[${colors.primary.dark}] focus:ring-[${colors.primary.main}] shadow-md`;
  const secondaryClasses = `bg-transparent border border-[${colors.secondary.main}] hover:bg-[${colors.neutral.gray[100]}] focus:ring-[${colors.secondary.main}]`;
  
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
      {IconComponent && (
        <IconComponent 
          size={16} 
          color={type === 'primary' ? colors.primary.contrast : colors.secondary.main}
        />
      )}
      <Text 
        as="span"
        size="md"
        weight="medium"
        color={type === 'primary' ? 'primary-contrast' : 'secondary-main'}
      >
        {text}
      </Text>
    </button>
  );
}; 