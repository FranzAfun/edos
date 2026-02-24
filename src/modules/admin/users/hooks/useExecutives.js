import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getExecutives } from "../services/userService";

export default function useExecutives() {
  return useModuleQuery(getExecutives);
}
