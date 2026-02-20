import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MobileSidebarToggle from "../components/ui/MobileSidebarToggle";

function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      
      {/* Sidebar */}
      <Sidebar title="EDOS" mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <MobileSidebarToggle onClick={() => setMobileSidebarOpen(true)} />
          <h2 className="text-sm font-semibold">
            EDOS
          </h2>
          <div className="w-9" aria-hidden="true" />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-[var(--color-background)] p-6 md:p-10">
          {children}
        </main>
      </div>

    </div>
  );
}

export default AppLayout;

