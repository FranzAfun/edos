import { useContext } from "react";
import FeatureContext from "./featureContextStore";

export function useFeature(flag) {
  const features = useContext(FeatureContext);
  return !!features[flag];
}
