/**
 * FormField - Reusable form field with label, validation, and accessible error messages (F36)
 */
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  disabled = false,
  children,
  className = "",
  helpText,
  ...rest
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hasError = !!error;

  if (children) {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        {children}
        {helpText && !hasError && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
        {hasError && (
          <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        <textarea
          id={id}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={4}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-gray-300 focus:ring-[var(--color-accent)]"}`}
          {...rest}
        />
        {helpText && !hasError && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
        {hasError && (
          <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        <select
          id={id}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-gray-300 focus:ring-[var(--color-accent)]"}`}
          {...rest}
        />
        {helpText && !hasError && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
        {hasError && (
          <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-gray-300 focus:ring-[var(--color-accent)]"}`}
        {...rest}
      />
      {helpText && !hasError && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {hasError && (
        <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
