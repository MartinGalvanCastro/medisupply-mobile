# Building Installable Test Apps

This guide covers how to create installable iOS and Android apps for testing using Expo EAS Build.

## Overview

The app uses **Expo Application Services (EAS)** to build installable apps that you can distribute to testers without publishing to the App Store or Google Play Store.

## Quick Start

```bash
# Build for iOS
yarn build:ios

# Build for Android
yarn build:android

# Build for both platforms
yarn build:all
```

## Prerequisites

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Create an Expo Account

If you don't have one:
```bash
eas login
```

Or sign up at: https://expo.dev/signup

### 3. Configure Your Project

Initialize EAS in your project (if not already done):
```bash
eas build:configure
```

This will use the existing `eas.json` configuration.

## Building for iOS

### Option 1: Build in the Cloud (Recommended)

```bash
yarn build:ios
```

This will:
1. Upload your code to Expo's servers
2. Build the app in the cloud
3. Provide a download link for the `.ipa` file

**Installing on Your iPhone:**

1. Download **Expo Orbit** app from the App Store (free)
2. Open the build URL on your iPhone
3. Tap "Open in Expo Orbit"
4. The app will install on your device

**Alternative Installation Methods:**

- **TestFlight**: Upload the `.ipa` to App Store Connect for TestFlight distribution
- **Direct Install**: Use Apple Configurator 2 (Mac only) to install the `.ipa` directly

### Requirements for iOS Builds

- Apple Developer account (free or paid)
- For device installation: Device UDID registered in your Apple Developer account
- For TestFlight: Paid Apple Developer account ($99/year)

### Registering Your Device

```bash
# Register a new iOS device
eas device:create
```

Follow the prompts to add your iPhone's UDID to your Apple Developer account.

## Building for Android

### Build an APK

```bash
yarn build:android
```

This will:
1. Upload your code to Expo's servers
2. Build an APK file in the cloud
3. Provide a download link

**Installing the APK:**

1. Download the APK file to your Android device
2. Open the file
3. Allow "Install from Unknown Sources" if prompted
4. Install the app

**Alternative Methods:**

- Scan the QR code provided after the build completes
- Use `adb install` to install from your computer:
  ```bash
  adb install path/to/your-app.apk
  ```

### No Requirements for Android

- No Google Play Developer account needed for APK builds
- APKs can be installed directly on any Android device

## Build Configuration

The project uses a single `preview` build profile defined in `eas.json`:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### What This Means

- **distribution: "internal"**: Builds for testing, not store submission
- **iOS simulator: false**: Builds for real devices (not simulator)
- **iOS buildConfiguration: "Release"**: Optimized build (faster, smaller)
- **Android buildType: "apk"**: Creates an APK (not AAB for Play Store)

## Build Process

### Step-by-Step

1. **Start the build:**
   ```bash
   yarn build:ios
   # or
   yarn build:android
   ```

2. **EAS will ask some questions** (first time only):
   - Project name
   - Bundle identifier (iOS) / Package name (Android)
   - Whether to generate credentials automatically

   **Recommended answers:**
   - Accept the suggested bundle identifier
   - Let EAS generate credentials automatically

3. **Monitor the build:**
   - You'll see a URL to track build progress
   - Builds typically take 5-15 minutes

4. **Download your app:**
   - When complete, you'll get a download link
   - The link is also available at: https://expo.dev/accounts/[your-account]/projects/medisupply-mobile/builds

## Build Output

### iOS (.ipa file)

- Can be installed via:
  - Expo Orbit app
  - TestFlight
  - Apple Configurator 2
  - Direct download (if device UDID is registered)

### Android (.apk file)

- Can be installed via:
  - Direct download and install
  - QR code scan
  - ADB (Android Debug Bridge)
  - File transfer to device

## Distributing to Testers

### iOS Distribution

**Option 1: Expo Orbit (Easiest)**
1. Share the build URL with testers
2. They download Expo Orbit from App Store
3. They open the URL and install

**Option 2: TestFlight (Most Professional)**
1. Upload the `.ipa` to App Store Connect
2. Add testers via email
3. They download TestFlight and install your app

**Option 3: Ad Hoc Distribution**
1. Register tester device UDIDs
2. Rebuild with registered devices
3. Share the `.ipa` file directly

### Android Distribution

**Option 1: Direct Download (Easiest)**
1. Share the build URL with testers
2. They download and install the APK
3. They may need to enable "Install from Unknown Sources"

**Option 2: QR Code**
1. Share the QR code from the build page
2. Testers scan and download
3. Install the APK

## Common Commands

```bash
# Build for iOS
yarn build:ios

# Build for Android
yarn build:android

# Build for both platforms
yarn build:all

# View build status
eas build:list

# View build details
eas build:view [build-id]

# Register iOS device
eas device:create

# View registered devices
eas device:list

# Cancel a running build
eas build:cancel
```

## Environment Variables

If your app needs environment variables at build time, create a `.env` file:

```bash
API_BASE_URL=https://bffproyecto.juanandresdeveloper.com
```

These will be included in the build automatically.

## Build Triggers

Builds can be triggered:

1. **Manually** (recommended for testing):
   ```bash
   yarn build:ios
   ```

2. **Via GitHub Actions** (configured in `.github/workflows/build.yml`):
   - Automatically on push to `main` branch
   - Can be disabled or customized

## Troubleshooting

### iOS Build Fails

**Problem: "No devices registered"**
```bash
eas device:create
```
Follow prompts to register your device.

**Problem: "Invalid credentials"**
```bash
eas credentials
```
Review and regenerate credentials if needed.

### Android Build Fails

**Problem: "Build failed during compilation"**
- Check the build logs at the provided URL
- Ensure all dependencies are compatible
- Try clearing cache: `eas build --clear-cache`

### Build Takes Too Long

- Expo's free tier has limited concurrent builds
- Upgrade to paid plan for faster builds
- Average build time: 5-15 minutes

### Can't Install on Device

**iOS:**
- Ensure device UDID is registered
- Check that device is running compatible iOS version
- Try installing via Expo Orbit

**Android:**
- Enable "Install from Unknown Sources"
- Check that device has enough storage
- Try transferring APK via USB and installing manually

## Build Costs

### Expo EAS Pricing

- **Free Tier**: 30 builds/month
- **Production Plan**: $29/month (unlimited builds)
- **Enterprise**: Custom pricing

See: https://expo.dev/pricing

### Additional Costs

**iOS:**
- Apple Developer Account: $99/year (only needed for TestFlight or App Store)
- Free account works for Ad Hoc distribution (up to 100 devices)

**Android:**
- No additional costs for APK distribution
- Google Play Developer: $25 one-time (only if publishing to Play Store)

## Best Practices

1. **Version your builds**: Update `version` in `app.json` before each build
2. **Use meaningful build names**: Add `--message` flag:
   ```bash
   eas build --platform ios --message "Fix login bug"
   ```
3. **Keep build history**: Don't delete old builds immediately
4. **Test on real devices**: Simulators/emulators don't catch all issues
5. **Document known issues**: Keep a changelog of what testers should test

## Advanced: Local Builds

You can also build locally (requires Mac for iOS):

```bash
# iOS (requires Mac + Xcode)
eas build --platform ios --local

# Android (works on any platform)
eas build --platform android --local
```

**When to use local builds:**
- You've exceeded EAS build quota
- You need faster iteration
- You have specific build requirements

## Next Steps

1. **First build**: Run `yarn build:android` (easiest to test)
2. **Install on your device**: Download and install the APK
3. **Test the app**: Verify all features work
4. **Share with testers**: Send them the build URL
5. **Iterate**: Make changes and rebuild as needed

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Application Services](https://expo.dev/eas)
- [iOS Distribution Guide](https://docs.expo.dev/build/internal-distribution/)
- [Android Distribution Guide](https://docs.expo.dev/build-reference/apk/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)

## Summary

For quick testing:
1. Run `yarn build:android` (easiest)
2. Wait 5-15 minutes for build to complete
3. Download and install the APK
4. Test your app!

For iOS:
1. Run `yarn build:ios`
2. Register your device if needed
3. Install via Expo Orbit or TestFlight
4. Test your app!
