import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-txt-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-bg-input text-txt-primary border rounded-element min-h-[44px] transition-colors focus:border-brand focus:ring-0 ${
          error ? 'border-status-failed' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-status-failed font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-txt-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-txt-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full p-3 text-sm bg-bg-input text-txt-primary border rounded-element min-h-[100px] transition-colors focus:border-brand focus:ring-0 ${
          error ? 'border-status-failed' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-status-failed font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-txt-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string }[];
}

export function Select({
  label,
  error,
  helperText,
  id,
  options,
  className = '',
  ...props
}: SelectProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-txt-primary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-bg-input text-txt-primary border rounded-element min-h-[44px] transition-colors focus:border-brand focus:ring-0 ${
          error ? 'border-status-failed' : 'border-border'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-status-failed font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-txt-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
