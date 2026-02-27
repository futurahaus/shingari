'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface QuantityInputProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  showButtons?: boolean;
  className?: string;
  /** Optional: show stock hint next to input */
  stockHint?: string;
}

const NUMERIC_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']);
const ALLOWED_KEYS = new Set([...NUMERIC_KEYS, 'Enter']);

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  size = 'md',
  showButtons = true,
  className = '',
  stockHint,
}: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = useCallback(
    (n: number): number => {
      let v = Math.floor(n);
      if (v < min) v = min;
      if (max != null && v > max) v = max;
      return v;
    },
    [min, max]
  );

  const commit = useCallback(() => {
    const parsed = parseInt(inputValue, 10);
    const valid = !Number.isNaN(parsed) && parsed >= min;
    const final = valid ? clamp(parsed) : value;
    setInputValue(String(final));
    if (final !== value) onChange(final);
  }, [inputValue, min, value, clamp, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!ALLOWED_KEYS.has(e.key) && !(e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) {
      setInputValue(v);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    commit();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(String(value));
  };

  useEffect(() => {
    if (!isFocused) setInputValue(String(value));
  }, [value, isFocused]);

  const sizeClasses = size === 'sm' ? 'w-10 h-7 text-xs' : 'w-12 h-9 text-sm';
  const btnSizeClasses = size === 'sm' ? 'w-6 h-7' : 'w-7 h-9';

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {showButtons && (
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => onChange(clamp(value - 1))}
          className={`${btnSizeClasses} flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Decrease"
        >
          -
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        min={min}
        max={max}
        className={`${sizeClasses} text-center border border-gray-300 bg-white focus:ring-2 focus:ring-[#EA3D15]/30 focus:border-[#EA3D15] outline-none ${!showButtons ? 'rounded' : 'rounded-none'}`}
        aria-label="Cantidad"
      />
      {showButtons && (
        <button
          type="button"
          disabled={disabled || (max != null && value >= max)}
          onClick={() => onChange(clamp(value + 1))}
          className={`${btnSizeClasses} flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Increase"
        >
          +
        </button>
      )}
      {stockHint && (
        <span className="ml-1 text-xs text-gray-500" title={stockHint}>
          {stockHint}
        </span>
      )}
    </div>
  );
}
