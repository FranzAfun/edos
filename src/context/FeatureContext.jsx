import { FEATURE_FLAGS } from "./featureConfig";
import FeatureContext from "./featureContextStore";

export function FeatureProvider({ children }) {
  return (
    <FeatureContext.Provider value={FEATURE_FLAGS}>
      {children}
    </FeatureContext.Provider>
  );
}
