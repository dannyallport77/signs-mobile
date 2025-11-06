# Signs Mobile App - Build Guide

## Problem with Local Build

The local iOS build is experiencing configuration issues with Expo Constants. The recommended solution is to use **EAS Build** (Expo's cloud build service).

## Recommended: EAS Build (Cloud Build)

This is the most reliable way to build and test the app with native modules.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

*Note: You'll need to create a free Expo account if you don't have one at https://expo.dev*

### Step 3: Configure EAS

```bash
cd "/Users/admin/Development/signs app/signs-mobile"
eas build:configure
```

### Step 4: Build for iOS

```bash
# Development build (for testing)
eas build --profile development --platform ios
```

This will:
- Build your app in the cloud (~15-20 minutes)
- Give you a QR code when done
- Install the app on your physical iOS device by scanning the QR

### Step 5: Run the Development Server

Once the app is installed on your device:

```bash
npx expo start --dev-client
```

Then open the installed app on your device - it will connect to your development server.

---

## Alternative: Simplified Testing (No Native Modules)

If you just want to test the basic app flow without Maps/NFC:

### Create a simplified test version:

1. **Temporarily comment out native modules** in `App.tsx`:
   - Comment out MapView import and usage
   - Comment out NFC functionality

2. **Run with Expo Go**:
   ```bash
   npx expo start
   ```
   
3. **Scan QR code** with Expo Go app on your phone

This won't have Maps or NFC, but you can test:
- Login/Auth flow
- Navigation
- API calls
- Business listing (in list view)

---

## For Production Builds

### iOS App Store:

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

### Android Play Store:

```bash
eas build --profile production --platform android
eas submit --platform android
```

---

## Troubleshooting

### "Build failed" on EAS:
- Check build logs in the Expo dashboard
- Ensure all environment variables are set
- Verify app.json configuration

### "Can't connect to development server":
- Ensure phone and computer are on same WiFi
- Check firewall settings
- Try using tunnel: `npx expo start --dev-client --tunnel`

### NFC not working:
- NFC only works on physical devices (iPhone 7+ or Android with NFC)
- Ensure proper permissions in app.json
- Check device NFC is enabled in Settings

---

## Quick Start (Recommended Path)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build
cd "/Users/admin/Development/signs app/signs-mobile"
eas build --profile development --platform ios

# 4. Wait for build (~20 min), install app on device via QR code

# 5. Start dev server
npx expo start --dev-client

# 6. Open installed app on your device
```

This is the fastest path to a working app with all native features! 🚀
