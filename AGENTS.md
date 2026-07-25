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

## CI

`.github/workflows/build.yml` runs on push to `main`/`master`, PRs, and `workflow_dispatch`. Sets up Node 20 + JDK 17 + Gradle 8.6, runs `npm install --legacy-peer-deps`, generates `android/app/debug.keystore` on the fly, then `gradle assembleDebug` from `android/`. Uploads `phone-dialer-debug-apk`.

See `dev.md` for sideload + default-dialer-role instructions.

## Version Pins / Build Quirks

- `react-native-screens: 3.34.0` — pinned. 3.36+ uses `BaseReactPackage` from RN 0.74's API and won't compile against RN 0.73.
- `react-native-reanimated: 3.16.7` — pinned. Newer requires RN 0.78+.
- `react-native-safe-area-context: 4.10.5` — pinned for the same RN compat reason.
- `org.gradle.configuration-cache=false` in `android/gradle.properties` — RN 0.73's `native_modules.gradle` spawns Node at configuration time, which is incompatible with the configuration cache.
- RN gradle plugin is loaded via `classpath("com.facebook.react:react-native-gradle-plugin")` in `android/build.gradle` + top-level `includeBuild('../node_modules/@react-native/gradle-plugin')` in `android/settings.gradle`.
- `MainApplication.kt` must `import com.facebook.react.PackageList` — autolinking generates the class at build time; without the import, kotlinc can't resolve it.
