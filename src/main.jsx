import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/system/ErrorBoundary";
import "./index.css";
import { AuthorityProvider } from "./context/AuthorityContext";
import { FeatureProvider } from "./context/FeatureContext";
import { RoleProvider } from "./context/RoleContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RoleProvider>
      <FeatureProvider>
        <AuthorityProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthorityProvider>
      </FeatureProvider>
    </RoleProvider>
  </React.StrictMode>
);
