import { createContext, useContext } from "react";
import { FEATURES } from "../config/features";

const FeatureContext = createContext(FEATURES);

export function FeatureProvider({ children }) {
  return (
    <FeatureContext.Provider value={FEATURES}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature(flag) {
  const features = useContext(FeatureContext);
  return !!features[flag];
}
