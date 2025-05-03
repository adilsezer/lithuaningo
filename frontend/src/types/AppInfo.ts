/**
 * Response containing application information for a specific platform
 */
export interface AppInfoResponse {
  /** The unique identifier of the app info */
  id: string;

  /** The platform identifier (e.g., "ios", "android") */
  platform: string;

  /** Current version of the application */
  currentVersion: string;

  /** Minimum supported version */
  minimumVersion: string;

  /** Whether there's a mandatory update required */
  forceUpdate: boolean;

  /** URL to update the application (App Store or Play Store) */
  updateUrl?: string;

  /** Whether the app is in maintenance mode */
  isMaintenance: boolean;

  /** Optional maintenance message to display to users */
  maintenanceMessage?: string;

  /** Release notes for the current version */
  releaseNotes?: string;
}
