import { ChevronDown } from "lucide-react";

export default function SelectField({ className = "", children, multiple, size, ...rest }) {
  const showChevron = !multiple && (!size || Number(size) <= 1);

  return (
    <div className="relative">
      <select
        className={`appearance-none ${className} ${showChevron ? "pr-10" : ""}`.trim()}
        multiple={multiple}
        size={size}
        {...rest}
      >
        {children}
      </select>
      {showChevron && (
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
