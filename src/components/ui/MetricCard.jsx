import Card from "./Card";

export default function MetricCard({
  label,
  value,
  trend = null,
  delta = null
}) {
  let trendColor = "text-gray-500";

  if (trend === "up") trendColor = "text-green-600";
  if (trend === "down") trendColor = "text-red-600";

  return (
    <Card>
      <div className="flex flex-col space-y-2">
        <div className="text-sm text-gray-500">
          {label}
        </div>

        <div className="text-2xl font-semibold">
          {value}
        </div>

        {delta && (
          <div className={`text-sm ${trendColor}`}>
            {delta}
          </div>
        )}
      </div>
    </Card>
  );
}
