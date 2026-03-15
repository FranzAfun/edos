/**
 * FormField - Reusable form field with label, validation, and accessible error messages (F36)
 */
import SelectField from "./SelectField";

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
  options = [],
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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        {children}
        {helpText && !hasError && <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{helpText}</p>}
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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
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
          className={`w-full rounded border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-[var(--color-border)] focus:ring-[var(--color-accent)]"}`}
          {...rest}
        />
        {helpText && !hasError && <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{helpText}</p>}
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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        <SelectField
          id={id}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`w-full rounded border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-[var(--color-border)] focus:ring-[var(--color-accent)]"}`}
          {...rest}
        >
          {options.map((option) => {
            const valueKey = typeof option === "object" ? option.value : option;
            const labelValue = typeof option === "object" ? option.label : option;

            return (
              <option key={String(valueKey)} value={valueKey}>
                {labelValue}
              </option>
            );
          })}
        </SelectField>
        {helpText && !hasError && <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{helpText}</p>}
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
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
        className={`w-full rounded border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 ${hasError ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-[var(--color-border)] focus:ring-[var(--color-accent)]"}`}
        {...rest}
      />
      {helpText && !hasError && <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{helpText}</p>}
      {hasError && (
        <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
