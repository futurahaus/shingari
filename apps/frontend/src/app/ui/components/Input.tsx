import React from 'react';
import * as FaIcons from 'react-icons/fa';
import { Text } from './Text';

interface InputProps {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  iconRight?: keyof typeof FaIcons;
  iconRightOnPress?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  error?: string;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeValue,
  iconRight,
  iconRightOnPress,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  testID,
}) => {
  const IconComponent = iconRight ? FaIcons[iconRight] : null;

  const baseInputClasses = `
    w-full px-4 py-3 rounded-[10px] border transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-[#1C0F0D] focus:border-[#1C0F0D]'
    }
    ${IconComponent ? 'pr-12' : ''}
  `;

  return (
    <div className="w-full" data-testid={testID}>
      {/* Label */}
      <Text 
        as="label" 
        size="sm" 
        weight="medium" 
        color={error ? 'error' : 'primary'}
        className="block mb-2"
      >
        {label}
      </Text>

      {/* Input container */}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseInputClasses}
        />

        {/* Right icon */}
        {IconComponent && (
          <button
            type="button"
            onClick={iconRightOnPress}
            disabled={disabled || !iconRightOnPress}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              p-1 rounded-md transition-colors duration-200 cursor-pointer
              ${disabled || !iconRightOnPress 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <IconComponent size={16} />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Text 
          as="p" 
          size="sm" 
          color="error" 
          className="mt-1"
          testID={`${testID}-error`}
        >
          {error}
        </Text>
      )}
    </div>
  );
}; 