export interface AppInfo {
  id: string;
  platform: string;
  currentVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateUrl?: string;
  isMaintenance: boolean;
  maintenanceMessage?: string;
  releaseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAppInfoRequest {
  currentVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateUrl?: string;
  isMaintenance: boolean;
  maintenanceMessage?: string;
  releaseNotes?: string;
}
