# Local Release Instructions

This document provides step-by-step instructions for creating a local release of the Expo project.

## Prerequisites

- Node.js and npm/yarn installed
- Expo CLI installed (`npm install -g expo-cli`)
- Android Studio installed (for building Android APKs)
- Xcode installed (for building iOS apps)
- Java Development Kit (JDK) installed

## Steps

### 1. Install Dependencies

Ensure all dependencies are installed:

\`\`\`bash
npm install

# or

yarn install
\`\`\`

### 2. Eject the Project (if necessary)

If you haven't already ejected your project from the managed workflow:

\`\`\`bash
expo eject
\`\`\`

### 3. Configure Android Build

Open the `android` folder in Android Studio and follow these steps:

- Set up your signing key as described [here](../android/README.md).

### 4. Build Android APK

In Android Studio:

1. Click on `Build > Generate Signed Bundle / APK`.
2. Follow the wizard to generate a signed APK.

Alternatively, use the command line:

\`\`\`bash
cd android
./gradlew assembleRelease
\`\`\`

### 5. Configure iOS Build

Open the `ios` folder in Xcode and follow these steps:

- Ensure you have the appropriate signing certificates and provisioning profiles.

### 6. Build iOS App

In Xcode:

1. Select your target device.
2. Click `Product > Archive`.
3. Follow the steps to create an IPA file.

### 7. Testing the Builds

Test the generated APK and IPA files on physical devices to ensure they work as expected.

### 8. Distribution

- For Android, upload the APK to Google Play Console.
- For iOS, upload the IPA to App Store Connect.

## Troubleshooting

- **Common issues and solutions**
- **Links to relevant documentation**

## References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
