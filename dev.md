# Developer Guide — Phone Dialer

Production-architected Android phone dialer. React Native UI + Kotlin native modules wrapping the Android Telecom framework.

## Toolchain

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| JDK | 17 (Temurin recommended) |
| Gradle | 8.6 (CI auto-installs) |
| AGP | 8.4.0 |
| Kotlin | 1.9.24 |
| Compile / Target SDK | 35 (Android 15) |
| Min SDK | 26 |

## Local build

```bash
npm install --legacy-peer-deps
npm run android                  # Build debug + install + Metro
npm start                        # Metro only
```

Direct gradle (from `android/`):

```bash
gradle assembleDebug             # Debug APK
gradle assembleRelease           # Release APK
gradle clean
```

## Install on phone (sideload)

1. Open the [Actions tab](../../actions) and pick the latest successful **Build APK** run.
2. Download `phone-dialer-debug-apk` from Artifacts.
3. Unzip → `app-debug.apk`.
4. Install:
   - **ADB**: `adb install -r app-debug.apk`
   - **Manual**: copy to phone, open from Files, accept "install from unknown source".
5. Grant the **Default Phone app** role:
   - Settings → Apps → Default apps → **Phone app** → select Phone Dialer.
   - Or call `DialerRoleModule.requestDialerRole()` from the in-app onboarding screen.
6. Grant runtime permissions when prompted: `READ_CONTACTS`, `READ_CALL_LOG`, `WRITE_CALL_LOG`, `READ_PHONE_STATE`, `CALL_PHONE`.

> The app must be the default phone app to use most native modules (`TelecomModule`, `InCallModule`). Without that role, calls won't route through the app.

## CI

`.github/workflows/build.yml` runs on push to `main`/`master`, PRs, and manual dispatch. Produces a debug APK artifact.

## Architecture quick reference

- Native modules live in `android/app/src/main/java/com/phonedialer/bridge/`.
- React Native UI in `src/`.
- State: Zustand stores in `src/core/store.ts`.
- Foreground service type: `FOREGROUND_SERVICE_TYPE_PHONE_CALL` (required on Android 14+).
- All manifest components have explicit `android:exported`.
