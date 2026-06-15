"use client";

import { useEffect } from "react";
import { registerServiceWorkerUpdates } from "@/lib/service-worker-update";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorkerUpdates().catch(console.error);
  }, []);

  return null;
}
