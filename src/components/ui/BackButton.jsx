import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="
        inline-flex items-center gap-2
        px-4 py-2
        text-sm font-medium
        rounded-xl
        border
        border-[var(--color-border)]
        bg-[var(--color-surface)]
        text-[var(--color-text-primary)]
        hover:bg-[var(--color-surface-hover)]
        transition-colors
        shadow-sm
      "
    >
      <span className="text-base">←</span>
      {label}
    </button>
  );
}
