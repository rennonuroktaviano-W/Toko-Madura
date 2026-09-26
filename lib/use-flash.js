"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFlash(durasi = 3000) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const flash = useCallback(
    (text, type = "ok") => {
      setMsg({ text, type });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(null), durasi);
    },
    [durasi]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [msg, flash];
}
