export default function Grid({
  children,
  cols = 3,
  className = ""
}) {
  const columnMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  const columns = columnMap[cols] || columnMap[3];

  return (
    <div className={`grid ${columns} gap-6 ${className}`}>
      {children}
    </div>
  );
}
