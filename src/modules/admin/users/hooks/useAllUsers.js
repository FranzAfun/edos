import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getAllUsers } from "../services/userService";

export default function useAllUsers() {
  return useModuleQuery(getAllUsers);
}
