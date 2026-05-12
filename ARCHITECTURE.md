# android-phone-dialer — Architecture

## High-Level Overview

`android-phone-dialer` is a React Native (TypeScript) phone dialer with a native Kotlin Android layer that integrates directly with the platform Telecom framework. The RN side renders the dial pad, call log, and contacts UI; the Kotlin side bridges to `android.telecom.*`, `ContactsContract`, and `CallLog` content providers and exposes them through a small set of `NativeModule`s.

The bridge follows a fixed pattern:

- TypeScript wrappers under `src/services/Native*.ts` expose a typed Promise-returning API.
- Each wrapper calls into a Kotlin `ReactContextBaseJavaModule` under `android/app/src/main/java/com/phonedialer/bridge/`.
- The bridge modules delegate to repository / manager classes under `com/phonedialer/contacts`, `com/phonedialer/calllogs`, and `com/phonedialer/telecom` so the JNI surface stays thin.

The app is designed to be installable as the **default dialer** via `RoleManager` (`android.app.role.DIALER`). Once granted, it registers a `ConnectionService` and an `InCallService` so the OS routes incoming and outgoing PSTN calls through it.

State on the RN side is held in a single Zustand store (`src/core/store.ts`). Navigation uses `@react-navigation/bottom-tabs` over three screens: Dial Pad, Call Logs, Contacts.

## Key Directories

- `src/` — React Native (TypeScript) sources.
  - `src/screens/` — Top-level tab screens.
  - `src/components/` — Reusable UI (dial pad buttons, list items, permission gate).
  - `src/services/` — TS-side bridge wrappers and pure helpers (phone-number formatting, permissions).
  - `src/hooks/` — Data hooks that wrap the native modules (`useContacts`, `useCallLogs`, `useDialerRole`, `usePermissions`).
  - `src/core/` — Zustand store, theme tokens, shared TS types.
  - `src/__tests__/` — Jest tests.
- `android/` — Gradle project.
  - `android/app/src/main/java/com/phonedialer/bridge/` — RN `NativeModule` + `ReactPackage` glue.
  - `android/app/src/main/java/com/phonedialer/telecom/` — `ConnectionService`, `InCallService`, `RoleManager` integration, outgoing-call placement.
  - `android/app/src/main/java/com/phonedialer/contacts/` — `ContactsContract` repository.
  - `android/app/src/main/java/com/phonedialer/calllogs/` — `CallLog.Calls` repository.
  - `android/app/src/main/AndroidManifest.xml` — Permissions, intent filters, services.
- `.github/workflows/` — CI: `build.yml` (PR checks) and `release.yml` (signed APK release).

## Important Files

### Android manifest & native services

- `android/app/src/main/AndroidManifest.xml` — Declares the permission set required for a dialer (`CALL_PHONE`, `READ_PHONE_STATE`, `READ_PHONE_NUMBERS`, `MANAGE_OWN_CALLS`, `READ_CONTACTS`, `READ_CALL_LOG`, `WRITE_CALL_LOG`, `FOREGROUND_SERVICE_PHONE_CALL`, `POST_NOTIFICATIONS`). Registers `MainActivity` with the intent filters the system uses to qualify a default-dialer candidate: `ACTION_DIAL` (with and without `tel:` data), `ACTION_CALL` (`tel:`), `ACTION_VIEW` (`tel:`, browsable), and `ACTION_CALL_PRIVILEGED`. Also registers two services bound by the Telecom framework: `DialerConnectionService` (`BIND_TELECOM_CONNECTION_SERVICE`) and `DialerInCallService` (`BIND_INCALL_SERVICE`, `foregroundServiceType="phoneCall"`, `IN_CALL_SERVICE_UI=true`).
- `android/app/src/main/java/com/phonedialer/MainApplication.kt` — RN host; registers `DialerPackage`.
- `android/app/src/main/java/com/phonedialer/MainActivity.kt` — RN entry activity.

### Native modules (bridge)

- `bridge/DialerPackage.kt` — `ReactPackage` exposing the modules below.
- `bridge/TelecomModule.kt` — Wraps `TelecomServiceManager` / `OutgoingCallManager` (place call, current calls).
- `bridge/InCallModule.kt` — Bridges `DialerInCallService` events (call state, answer/reject/hangup) to JS.
- `bridge/DialerRoleModule.kt` — Requests and queries the default-dialer role via `DialerRoleManager`.
- `bridge/ContactsModule.kt` / `bridge/CallLogModule.kt` — Read-only access to `ContactsContract` and `CallLog.Calls` via their respective repository classes.

### Telecom integration

- `telecom/DialerConnectionService.kt` — Creates `Connection` instances for outgoing calls.
- `telecom/DialerInCallService.kt` — Receives `Call` callbacks while the app is the default dialer; surfaces state to JS through `InCallModule`.
- `telecom/DialerRoleManager.kt` — Wraps `RoleManager.createRequestRoleIntent(ROLE_DIALER)`.
- `telecom/TelecomServiceManager.kt`, `telecom/OutgoingCallManager.kt` — Place calls via `TelecomManager.placeCall` / `ACTION_CALL` fallback.

### RN side

- `package.json` — RN 0.73.4, React 18.2, navigation, `zustand`, `react-native-haptic-feedback`.
- `src/App.tsx` — Tab navigator root.
- `src/screens/DialPadScreen.tsx`, `CallLogsScreen.tsx`, `ContactsScreen.tsx` — Tab screens.
- `src/services/Native*.ts` — Typed wrappers around each Kotlin bridge module.
- `src/services/PermissionsService.ts`, `src/services/PhoneNumberFormatter.ts` — Pure helpers.
- `src/components/PermissionGate.tsx` — Gates the UI until runtime permissions and the dialer role are granted.

## Build & Release Flow

- **Local release build:** `npm run build:release` → `cd android && ./gradlew assembleRelease`. Output APK at `android/app/build/outputs/apk/release/app-release.apk`.
- **CI release:** `.github/workflows/release.yml`, `workflow_dispatch` only. Inputs: `tag` (e.g. `v1.0.3`) and `notes`. Steps: checkout → Node 20 → JDK 17 (Temurin) → `npm ci --legacy-peer-deps || npm install --no-fund --prefer-offline --legacy-peer-deps` → Gradle 8.6 setup → generate debug keystore if absent → `gradle assembleRelease --no-daemon` → stage APK as `phone-dialer-<tag>-release.apk` → publish via `softprops/action-gh-release@v2` against the supplied tag. Permissions: `contents: write`.
- **PR CI:** `.github/workflows/build.yml` runs lint, typecheck, and Jest on pull requests.
