import { useCallback, useRef, useState, type DragEvent } from "react";

/** Evita parpadeos al pasar por hijos dentro de la zona de drop. */
export function useDropHighlight() {
  const depth = useRef(0);
  const [active, setActive] = useState(false);

  const onDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    depth.current += 1;
    setActive(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setActive(false);
  }, []);

  const reset = useCallback(() => {
    depth.current = 0;
    setActive(false);
  }, []);

  return { active, onDragEnter, onDragLeave, reset };
}
