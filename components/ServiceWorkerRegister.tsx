"use client";

import { useEffect } from "react";

function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const base = getBasePath();
      navigator.serviceWorker.register(`${base}/sw.js`).catch(console.error);
    }
  }, []);

  return null;
}
