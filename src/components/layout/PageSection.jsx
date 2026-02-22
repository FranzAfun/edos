export default function PageSection({
  title,
  subtitle,
  children
}) {
  return (
    <div className="mb-10">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div>
        {children}
      </div>
    </div>
  );
}
