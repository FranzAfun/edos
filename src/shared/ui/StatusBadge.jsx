/**
 * StatusBadge - Reusable status indicator
 */
const VARIANTS = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-800",
  purple: "bg-purple-100 text-purple-800",
};

export default function StatusBadge({ label, variant = "neutral", className = "" }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
    >
      {label}
    </span>
  );
}
