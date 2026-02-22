import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AuthorityHeader from "../components/layout/AuthorityHeader";

function ExecutiveLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar title="EDOS - Executive" />

      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            EDOS
          </h2>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            <AuthorityHeader />
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

export default ExecutiveLayout;
