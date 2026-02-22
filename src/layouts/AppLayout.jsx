import React from "react";
import Sidebar from "../components/Sidebar";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <Sidebar title="EDOS" />

      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            EDOS
          </h2>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 bg-white">
          {children}
        </main>
      </div>

    </div>
  );
}

export default AppLayout;
