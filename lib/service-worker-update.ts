import { showToast } from "./use-toast";

export const SKIP_WAITING_MESSAGE = { type: "SKIP_WAITING" } as const;

let updateToastShown = false;
let reloadPending = false;

function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

function promptReload(registration: ServiceWorkerRegistration) {
  if (updateToastShown || !registration.waiting) return;
  updateToastShown = true;

  showToast({
    message: "Update available — reload to get the latest version.",
    actionLabel: "Reload",
    duration: null,
    onAction: () => applyServiceWorkerUpdate(registration),
  });
}

export function applyServiceWorkerUpdate(
  registration: ServiceWorkerRegistration
) {
  const waiting = registration.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }

  reloadPending = true;
  waiting.postMessage(SKIP_WAITING_MESSAGE);
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    promptReload(registration);
  }

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;

    installing.addEventListener("statechange", () => {
      if (
        installing.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        promptReload(registration);
      }
    });
  });
}

export async function registerServiceWorkerUpdates(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloadPending) return;
    window.location.reload();
  });

  const base = getBasePath();
  const registration = await navigator.serviceWorker.register(`${base}/sw.js`);

  watchRegistration(registration);

  const recheck = () => {
    registration.update().catch(() => {});
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    registration.update().catch(() => {});
    if (registration.waiting) {
      updateToastShown = false;
      promptReload(registration);
    }
  });

  window.setInterval(recheck, 60 * 60 * 1000);
}
