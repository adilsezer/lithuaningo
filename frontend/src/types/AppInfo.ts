/**
 * Application information for a specific platform
 */
export interface AppInfo {
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

  /** When the app info was created */
  createdAt: string;

  /** When the app info was last updated */
  updatedAt: string;
}

/**
 * Request to update application information
 */
export interface UpdateAppInfoRequest {
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

  /** Optional maintenance message to display to users (max 500 chars) */
  maintenanceMessage?: string;

  /** Release notes for the current version (max 1000 chars) */
  releaseNotes?: string;
}

/**
 * Regular expression for validating version numbers (X.Y.Z format)
 */
export const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
