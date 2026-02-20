import Card from "./Card";

export default function MetricCard({
  label,
  value,
  trend = null,
  delta = null
}) {
  let trendColor = "text-[var(--color-text-muted)]";

  if (trend === "up") trendColor = "text-green-600";
  if (trend === "down") trendColor = "text-red-600";

  return (
    <Card>
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
        </div>

        <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {value}
        </div>

        {delta && (
          <div className={`text-sm font-medium ${trendColor}`}>
            {delta}
          </div>
        )}
      </div>
    </Card>
  );
}
