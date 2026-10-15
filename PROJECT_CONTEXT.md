# Recovery App - Project Context & Conversation History

## 1. Project Overview
- **Project Name**: Recover / Recovery App
- **Tech Stack**: 
  - **Framework**: React Native 0.86 with Expo SDK ~57
  - **React Version**: React 19.2.3, React DOM 19.2.3
  - **Language**: TypeScript (~6.0)
  - **Navigation**: React Navigation Native (`@react-navigation/native` v7, `@react-navigation/native-stack` v7)
  - **Styling & UI**: Expo Linear Gradient, Expo Blur, Expo Vector Icons (`@expo/vector-icons`), React Native SVG, React Native Reanimated (v4.5)
  - **Platform**: iOS, Android, and Web (`react-native-web`)

---

## 2. Visual Design & Reference Mockups
The repository root contains high-fidelity design mockups:
- `01-signup.png`: Sign Up / Onboarding screen with custom inputs, social auth, and clean typography.
- `02-hero-photo.jpg`: Hero photography & branding imagery.
- `03-get-started.jpg`: Getting Started splash & introduction flow.
- `04-dashboard-top.jpg`: Top portion of main dashboard (wellness tracking, recovery scores, daily metrics).
- `05-dashboard-scrolled.jpg`: Scrolled view of dashboard (analytics, insights, streak tracking).
- `recover.jpg`: App identity / banner concept.

---

## 3. Project Structure
```text
/
├── App.tsx                      # Main app entrypoint with navigation setup
├── index.ts                     # Expo registration entrypoint
├── app.json                     # Expo app configuration
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── PROJECT_CONTEXT.md           # This context briefing file
├── assets/                      # Application icons, coin assets, graphics
├── src/                         # Source code
│   ├── components/              # Reusable UI components
│   ├── screens/                 # Application screens (Auth, Dashboard, Profile, etc.)
│   ├── navigation/              # Stack & tab navigation definitions
│   └── theme/                   # Colors, typography, spacing tokens
└── .devcontainer/               # Cloud devcontainer configuration
```

---

## 4. Key Scripts & Running the App
- `npm start` or `npx expo start`: Start Expo Metro Bundler
- `npm run web`: Run app in web browser
- `npm run android`: Run app on Android device / emulator
- `npm run ios`: Run app on iOS simulator

---

## 5. Development Roadmap & Ongoing Tasks
1. **Screen Implementation**: Ensure all screens match the visual mockups (`01` through `05`).
2. **Interactive Components**: Polish animations using `react-native-reanimated`.
3. **State Management**: Persist user sessions and recovery logs using `@react-native-async-storage/async-storage`.
4. **Cloud / Mobile Remote Execution**: The project is deployed on a cloud development server so the developer can build, test, and iterate on features directly from their mobile phone or any web browser 24/7 without requiring a laptop to be powered on.
