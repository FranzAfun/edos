import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | EDOS` : "EDOS - ERA Digital Operating System";
  }, [title]);
}