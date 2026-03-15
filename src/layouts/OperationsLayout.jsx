import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AuthorityHeader from "../components/layout/AuthorityHeader";
import MobileSidebarToggle from "../components/ui/MobileSidebarToggle";
import { useAuthority } from "../context/useAuthority";
import useRole from "../hooks/useRole";
import { getOperationalRoleLabel } from "../config/roles";

function OperationsLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const authority = useAuthority();
  const { role } = useRole();
  const roleLabel = getOperationalRoleLabel(role);

  if (!authority) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      
      {/* Sidebar */}
      <Sidebar
        title={`EDOS - ${roleLabel}`}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="md:hidden flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <MobileSidebarToggle onClick={() => setMobileSidebarOpen(true)} />
          <h2 className="text-sm font-semibold">
            EDOS
          </h2>
          <div className="w-9" aria-hidden="true" />
        </div>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--color-background)]">
          <div className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <AuthorityHeader onToggleSidebar={() => setCollapsed((current) => !current)} collapsed={collapsed} />
            <div className="mx-auto w-full max-w-6xl space-y-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

export default OperationsLayout;



