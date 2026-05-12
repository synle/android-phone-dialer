# DEV

React Native + Kotlin Android phone dialer wrapping the Android Telecom framework. Native modules in `android/app/src/main/java/com/phonedialer/bridge/`; RN UI in `src/` with Zustand state.

## Quick Start

```bash
npm ci || npm install --no-fund --prefer-offline --legacy-peer-deps
```

```bash
npm start                        # Metro bundler
npm run android                  # Build debug, install, launch Metro
```

```bash
npm test                         # Jest
npm run lint                     # ESLint
npm run typecheck                # tsc --noEmit
```

```bash
cd android && ./gradlew assembleDebug      # Debug APK
cd android && ./gradlew assembleRelease    # Release APK
npm run clean                              # gradlew clean
```

Sideload (debug APK from CI Actions artifact):

```bash
adb install -r app-debug.apk
```

Toolchain: Node 20.x, JDK 17, Gradle 8.6, AGP 8.4.0, Kotlin 1.9.24, compile/target SDK 35, min SDK 26. Grant the Default Phone app role + runtime perms (`READ_CONTACTS`, `READ_CALL_LOG`, `WRITE_CALL_LOG`, `READ_PHONE_STATE`, `CALL_PHONE`) for native modules to route calls.
