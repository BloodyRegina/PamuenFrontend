import React from 'react';

const InputField = React.forwardRef(({
    label,
    type = 'text',
    error,
    className = '',
    required = false,
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all
          ${error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'}
        `}
                {...props}
            />
            {error && (
                <span className="text-xs text-rose-500 mt-1">{error}</span>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;
