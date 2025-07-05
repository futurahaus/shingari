import React from 'react';
import * as FaIcons from 'react-icons/fa';
import { colors } from '../colors';
import { Text, TextProps } from './Text';

interface ButtonProps {
  onPress: () => void;
  type: 'primary' | 'primary-admin' | 'secondary';
  text?: string;
  testID: string;
  icon?: keyof typeof FaIcons;
  inline?: boolean;
  textProps?: Omit<TextProps, 'children'>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  type,
  text,
  testID,
  icon,
  inline = false,
  textProps = {},
}) => {
  const baseClasses = `px-6 py-3 rounded-[10px] font-medium text-base text-center min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer ${inline ? '' : 'w-full'}`;
  
  const primaryClasses = `bg-[${colors.primary.main}] hover:bg-[${colors.primary.dark}] focus:ring-[${colors.primary.main}] shadow-md`;
  const primaryAdminClasses = `bg-[${colors.admin.main}] hover:bg-[${colors.admin.light}] focus:ring-[${colors.admin.main}] shadow-md`;
  const secondaryClasses = `bg-transparent border border-[${colors.secondary.main}] hover:bg-[${colors.neutral.gray[100]}] focus:ring-[${colors.secondary.main}]`;
  
  const buttonClasses = type === 'primary' 
    ? `${baseClasses} ${primaryClasses}`
    : type === 'primary-admin'
    ? `${baseClasses} ${primaryAdminClasses}`
    : `${baseClasses} ${secondaryClasses}`;

  const IconComponent = icon ? FaIcons[icon] : null;

  // Valores por defecto para el texto del botón
  const defaultTextProps: Omit<TextProps, 'children'> = {
    size: 'md',
    weight: 'medium',
    color: type === 'primary' || type === 'primary-admin' ? 'primary-contrast' : 'secondary-main',
    as: 'span',
  };

  // Combinar props por defecto con las personalizadas
  const finalTextProps: Omit<TextProps, 'children'> = {
    ...defaultTextProps,
    ...textProps,
  };

  return (
    <button
      className={buttonClasses}
      onClick={onPress}
      data-testid={testID}
    >
      {IconComponent && (
        <IconComponent 
          size={16} 
          color={type === 'primary' || type === 'primary-admin' ? colors.primary.contrast : colors.secondary.main}
        />
      )}
      {text && (
        <Text 
          {...finalTextProps}
        >
          {text}
        </Text>
      )}
    </button>
  );
}; 