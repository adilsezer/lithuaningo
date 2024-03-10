// In your theme.d.ts file
import "@rneui/themed";

declare module "@rneui/themed" {
  export interface Colors {
    primaryLight: string;
    primaryDark: string;
    secondaryLight: string;
    secondaryDark: string;
  }
}
