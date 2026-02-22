import useRole from "../../hooks/useRole";

const roleOptions = ["executive", "finance", "ceo"];

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
        className="w-32 rounded border border-amber-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
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
