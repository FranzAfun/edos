/**
 * StatusBadge - Reusable status indicator
 */
const VARIANTS = {
  success: "bg-[rgba(34,197,94,0.16)] text-[#22C55E]",
  warning: "bg-[rgba(245,158,11,0.16)] text-[#F59E0B]",
  danger: "bg-[rgba(239,68,68,0.16)] text-[#EF4444]",
  info: "bg-[rgba(59,130,246,0.16)] text-[#3B82F6]",
  neutral: "bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]",
  purple: "bg-[rgba(139,92,246,0.16)] text-[#8B5CF6]",
};

export default function StatusBadge({ label, children, variant = "neutral", className = "" }) {
  const content = label ?? children;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
    >
      {content}
    </span>
  );
}
