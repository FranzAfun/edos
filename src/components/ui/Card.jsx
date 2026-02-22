export default function Card({
  children,
  className = ""
}) {
  return (
    <div
      className={`bg-white rounded-md shadow-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}
