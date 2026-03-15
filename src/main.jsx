import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/system/ErrorBoundary";
import "./index.css";
import { AuthorityProvider } from "./context/AuthorityContext.jsx";
import { FeatureProvider } from "./context/FeatureContext.jsx";
import { RoleProvider } from "./context/RoleContext";

const storedTheme = window.localStorage.getItem("edos_theme");
const initialTheme = storedTheme === "dark" || storedTheme === "light"
  ? storedTheme
  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", initialTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="app-container min-h-screen w-full overflow-x-hidden">
      <RoleProvider>
        <FeatureProvider>
          <AuthorityProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </AuthorityProvider>
        </FeatureProvider>
      </RoleProvider>
    </div>
  </React.StrictMode>
);
