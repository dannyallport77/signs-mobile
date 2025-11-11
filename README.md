# Review Signs NFC Programmer

A React Native mobile application for writing NFC tags with business review links. Perfect for franchise partners managing customer feedback systems with Google Maps integration.

[![App Store](https://img.shields.io/badge/App%20Store-Download-blue)](https://apps.apple.com/app/review-signs-nfc-programmer/id6755160639)

## 📱 Features

- **NFC Tag Writing**: Write business review links directly to NFC tags
- **Google Maps Integration**: Search and find nearby businesses with location services
- **Business Details**: View comprehensive business information including:
  - Business name and address
  - Phone numbers and websites
  - Operating hours
  - Review ratings and counts
- **User Authentication**: Secure login system for franchise partners
- **Cross-Platform**: Built with React Native and Expo for iOS and Android

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **NFC**: react-native-nfc-manager
- **Maps**: Google Maps API
- **Location**: expo-location
- **Build System**: EAS Build
- **Architecture**: New React Native Architecture enabled

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (for iOS development) or Android Emulator
- Physical device with NFC capability for testing NFC features

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dannyallport77/signs-mobile.git
cd signs-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_API_URL=your_api_url_here
```

### Google Maps API Key

The app requires a Google Maps API key for location services. Update the key in `app.json`:

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_API_KEY"
  }
}
```

## 📦 Building

### Development Build

```bash
eas build --profile development --platform ios
```

### Production Build

```bash
eas build --profile production --platform ios
```

## 🚢 Deployment

### Submit to App Store

```bash
eas submit --platform ios --latest
```

## 📱 App Structure

```
signs-mobile/
├── screens/              # Application screens
│   ├── MapScreen.tsx    # Google Maps integration
│   ├── BusinessDetailScreen.tsx
│   └── LoginScreen.tsx
├── assets/              # Images, icons, and fonts
├── ios/                 # iOS native code
├── android/             # Android native code
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── App.tsx             # Root component
```

## 🔒 Permissions

### iOS
- **NFC**: Required for writing to NFC tags
- **Location**: Required for finding nearby businesses

### Android
- **NFC**: Required for writing to NFC tags
- **ACCESS_FINE_LOCATION**: Required for precise location
- **ACCESS_COARSE_LOCATION**: Required for approximate location

## 📄 License

Copyright © 2025 Danny Allport. All rights reserved.

## 👨‍💻 Author

**Danny Allport**
- Email: dannyallport@icloud.com
- GitHub: [@dannyallport77](https://github.com/dannyallport77)

## 🤝 Support

For support, please contact dannyallport@icloud.com

## 📝 Notes

- NFC functionality requires a physical device with NFC capabilities
- Location services must be enabled for business search
- The app uses the New React Native Architecture for improved performance
