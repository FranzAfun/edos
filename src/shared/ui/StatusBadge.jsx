/**
 * StatusBadge - Reusable status indicator
 */
import { semanticStatus } from "@/theme/semanticColors";

const VARIANTS = {
  success: semanticStatus.success,
  warning: semanticStatus.warning,
  danger: semanticStatus.error,
  info: semanticStatus.info,
  neutral: {
    bg: semanticStatus.info.bg,
    text: semanticStatus.info.text,
    border: semanticStatus.info.border,
  },
  purple: {
    bg: semanticStatus.info.bg,
    text: semanticStatus.info.text,
    border: semanticStatus.info.border,
  },
};

export default function StatusBadge({ label, children, variant = "neutral", className = "" }) {
  const content = label ?? children;
  const palette = VARIANTS[variant] || VARIANTS.neutral;
  const style = {
    backgroundColor: palette.bg || palette.backgroundColor,
    color: palette.text || palette.color,
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={style}
    >
      {content}
    </span>
  );
}
