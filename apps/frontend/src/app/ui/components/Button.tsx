import React from 'react';
import * as FaIcons from 'react-icons/fa';
import { colors } from '../colors';
import { Text, TextProps } from './Text';

interface ButtonProps {
  onPress: () => void;
  type: 'primary' | 'primary-admin' | 'secondary' | 'tertiary';
  text?: string;
  testID: string;
  icon?: keyof typeof FaIcons;
  inline?: boolean;
  textProps?: Omit<TextProps, 'children'>;
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  type,
  text,
  testID,
  icon,
  inline = false,
  textProps = {},
  htmlType = 'button',
  disabled = false,
  size = 'lg',
}) => {
  const getPaddingClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1';
      case 'md': return 'px-4 py-2';
      case 'lg': return 'px-6 py-3';
      default: return 'px-6 py-3';
    }
  };

  const baseClasses = `${getPaddingClasses()} rounded-[10px] font-medium text-base text-center min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${inline ? '' : 'w-full'}`;
  
  const primaryClasses = disabled 
    ? `bg-[${colors.neutral.gray[400]}] shadow-none`
    : `bg-[${colors.primary.main}] hover:bg-[${colors.primary.dark}] focus:ring-[${colors.primary.main}] shadow-md`;
  
  const primaryAdminClasses = disabled 
    ? `bg-[${colors.neutral.gray[400]}] shadow-none`
    : `bg-[${colors.admin.main}] hover:bg-[${colors.admin.light}] focus:ring-[${colors.admin.main}] shadow-md`;
  
  const secondaryClasses = disabled 
    ? `bg-transparent border border-[${colors.neutral.gray[300]}] shadow-none`
    : `bg-transparent border border-[${colors.secondary.main}] hover:bg-[${colors.neutral.gray[100]}] focus:ring-[${colors.secondary.main}]`;
  
  const tertiaryClasses = disabled 
    ? `bg-transparent shadow-none`
    : `bg-transparent hover:bg-[${colors.neutral.gray[100]}] focus:ring-[${colors.primary.main}]`;
  
  const buttonClasses = type === 'primary' 
    ? `${baseClasses} ${primaryClasses}`
    : type === 'primary-admin'
    ? `${baseClasses} ${primaryAdminClasses}`
    : type === 'secondary'
    ? `${baseClasses} ${secondaryClasses}`
    : `${baseClasses} ${tertiaryClasses}`;

  const IconComponent = icon ? FaIcons[icon] : null;

  // Valores por defecto para el texto del botón
  const defaultTextProps: Omit<TextProps, 'children'> = {
    size: 'md',
    weight: 'medium',
    color: disabled 
      ? 'tertiary' 
      : type === 'primary' || type === 'primary-admin' 
        ? 'primary-contrast' 
        : type === 'tertiary' 
          ? 'primary-main' 
          : 'secondary-main',
    as: 'span',
  };

  // Combinar props por defecto con las personalizadas
  const finalTextProps: Omit<TextProps, 'children'> = {
    ...defaultTextProps,
    ...textProps,
  };

  return (
    <button
      type={htmlType}
      className={buttonClasses}
      onClick={disabled ? undefined : onPress}
      data-testid={testID}
      disabled={disabled}
    >
      {IconComponent && (
        <IconComponent 
          size={16} 
          color={disabled 
            ? colors.neutral.gray[500] 
            : type === 'primary' || type === 'primary-admin' 
              ? colors.primary.contrast 
              : type === 'tertiary' 
                ? colors.primary.main 
                : colors.secondary.main}
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