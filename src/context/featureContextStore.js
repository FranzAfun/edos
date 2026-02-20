import { createContext } from "react";
import { FEATURE_FLAGS } from "./featureConfig";

const FeatureContext = createContext(FEATURE_FLAGS);

export default FeatureContext;
