import type { TimelineData } from "./types";
import { createBackupFile } from "./parse-timeline-data";

export function downloadTimelineBackup(data: TimelineData): void {
  const backup = createBackupFile(data);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
