import useRole from "../../hooks/useRole";

const roleOptions = ["executive", "dept_head", "finance", "operations", "ceo", "admin"];

export default function DevRoleSwitcher() {
  const { role, setRole } = useRole();

  if (!import.meta.env.DEV) {
    return null;
  }

  function handleRoleChange(event) {
    const nextRole = event.target.value;
    setRole(nextRole);
    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md border border-amber-400 bg-amber-50/95 px-3 py-2 text-xs shadow-md">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        Dev Role
      </div>
      <select
        value={role}
        onChange={handleRoleChange}
        className="w-32 rounded border border-amber-300 bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-amber-500"
        aria-label="Development role switcher"
      >
        {roleOptions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
