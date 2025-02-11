export interface AppInfo {
  id: string;
  platform: string;
  latestVersion: string;
  minimumVersion: string;
  isMaintenance: boolean;
  maintenanceMessage?: string;
  forceUpdate: boolean;
  updateUrl?: string;
  releaseNotes?: string;
  createdAt: string;
  updatedAt: string;
}
