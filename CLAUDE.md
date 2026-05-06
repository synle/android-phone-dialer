# Phone Dialer - Project Instructions

## Overview
Production-architected Android phone dialer built with React Native 0.73.4 + Kotlin native modules. Targets Android 15 (API 35) on Samsung Galaxy S24 Ultra. Developed on Windows 11.

## Tech Stack
- **UI**: React Native (TypeScript), React Navigation, Zustand, Reanimated
- **Native**: Kotlin (minSdk 26, compileSdk 35, targetSdk 35), Coroutines
- **Build**: Gradle 8.6, AGP 8.4.0, Kotlin 1.9.24, JDK 17
- **Target device**: Samsung Galaxy S24 Ultra, Android 15, One UI 7
- **Dev OS**: Windows 11

## Architecture
- Two-layer: Native Android (Kotlin) handles all Telecom framework / content provider work. React Native handles all UI.
- Bridge modules in `android/.../bridge/` connect the two layers.
- Native modules: DialerRoleModule, TelecomModule, ContactsModule, CallLogModule, InCallModule.
- State management: Zustand stores in `src/core/store.ts`.

## Key Paths
- Native Kotlin: `android/app/src/main/java/com/phonedialer/`
- React Native TS: `src/`
- Manifest: `android/app/src/main/AndroidManifest.xml`
- Gradle: `android/build.gradle`, `android/app/build.gradle`

## Conventions
- No Java. Kotlin only.
- No deprecated Android APIs. minSdk 26+.
- All native queries on Dispatchers.IO with cursor safety.
- Bridge modules cancel coroutine scopes in invalidate().
- All list components use React.memo.
- TypeScript strict mode.
- Windows: use `.\gradlew.bat` not `./gradlew`. Use backslash paths in PowerShell.

## Android 15 / API 35 Notes
- Edge-to-edge enforced: handled in MainActivity + styles.xml
- Foreground service type required: DialerInCallService uses FOREGROUND_SERVICE_TYPE_PHONE_CALL
- All manifest components have explicit android:exported
- AndroidX 1.13+ required for insets APIs
