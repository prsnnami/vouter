import { useEffect, useRef } from "react";

export default function(callback: () => void) {
  const hasRendered = useRef(false);

  useEffect(() => {
    hasRendered.current = true;
  }, []);

  if (!hasRendered.current) {
    callback();
  }
}
