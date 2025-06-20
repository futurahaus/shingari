import React from 'react';
import { colors } from '../colors';

// Tipos para las propiedades del componente
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type TextColor = 
  // Colores de texto específicos
  | 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse'
  // Colores de la paleta principal
  | 'primary-main' | 'primary-light' | 'primary-dark' | 'primary-contrast'
  | 'secondary-main' | 'secondary-light' | 'secondary-dark' | 'secondary-contrast'
  // Colores de estado
  | 'success' | 'warning' | 'error' | 'info'
  | 'success-light' | 'success-dark' | 'warning-light' | 'warning-dark'
  | 'error-light' | 'error-dark' | 'info-light' | 'info-dark'
  // Colores de gris
  | 'gray-50' | 'gray-100' | 'gray-200' | 'gray-300' | 'gray-400' 
  | 'gray-500' | 'gray-600' | 'gray-700' | 'gray-800' | 'gray-900'
  | 'white';

interface TextProps {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  testID?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  weight = 'normal',
  color = 'primary',
  className = '',
  as: Component = 'p',
  testID,
}) => {
  // Mapeo de tamaños a clases de Tailwind
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  // Mapeo de pesos a clases de Tailwind
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  // Función para obtener el color de la paleta
  const getColorValue = (colorKey: TextColor): string => {
    switch (colorKey) {
      // Colores de texto específicos
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'tertiary':
        return colors.text.tertiary;
      case 'disabled':
        return colors.text.disabled;
      case 'inverse':
        return colors.text.inverse;
      
      // Colores principales
      case 'primary-main':
        return colors.primary.main;
      case 'primary-light':
        return colors.primary.light;
      case 'primary-dark':
        return colors.primary.dark;
      case 'primary-contrast':
        return colors.primary.contrast;
      
      // Colores secundarios
      case 'secondary-main':
        return colors.secondary.main;
      case 'secondary-light':
        return colors.secondary.light;
      case 'secondary-dark':
        return colors.secondary.dark;
      case 'secondary-contrast':
        return colors.secondary.contrast;
      
      // Colores de estado
      case 'success':
        return colors.status.success.main;
      case 'success-light':
        return colors.status.success.light;
      case 'success-dark':
        return colors.status.success.dark;
      case 'warning':
        return colors.status.warning.main;
      case 'warning-light':
        return colors.status.warning.light;
      case 'warning-dark':
        return colors.status.warning.dark;
      case 'error':
        return colors.status.error.main;
      case 'error-light':
        return colors.status.error.light;
      case 'error-dark':
        return colors.status.error.dark;
      case 'info':
        return colors.status.info.main;
      case 'info-light':
        return colors.status.info.light;
      case 'info-dark':
        return colors.status.info.dark;
      
      // Colores de gris
      case 'gray-50':
        return colors.neutral.gray[50];
      case 'gray-100':
        return colors.neutral.gray[100];
      case 'gray-200':
        return colors.neutral.gray[200];
      case 'gray-300':
        return colors.neutral.gray[300];
      case 'gray-400':
        return colors.neutral.gray[400];
      case 'gray-500':
        return colors.neutral.gray[500];
      case 'gray-600':
        return colors.neutral.gray[600];
      case 'gray-700':
        return colors.neutral.gray[700];
      case 'gray-800':
        return colors.neutral.gray[800];
      case 'gray-900':
        return colors.neutral.gray[900];
      
      // Blanco
      case 'white':
        return colors.neutral.white;
      
      default:
        return colors.text.primary;
    }
  };

  // Construir las clases CSS (sin color)
  const textClasses = [
    sizeClasses[size],
    weightClasses[weight],
    className
  ].filter(Boolean).join(' ');

  // Obtener el color como valor
  const colorValue = getColorValue(color);

  return (
    <Component
      className={textClasses}
      style={{ color: colorValue }}
      data-testid={testID}
    >
      {children}
    </Component>
  );
}; 