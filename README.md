# Phone Dialer

Production-architected Android phone dialer. React Native 0.73 UI + Kotlin native modules.
Targets **Android 15 (API 35)** on **Samsung Galaxy S24 Ultra (One UI 7)**.
Developed on **Windows 11**.

| | Version |
|---|---|
| compileSdk / targetSdk | 35 (Android 15) |
| minSdk | 26 (Android 8.0) |
| React Native | 0.73.4 |
| Kotlin | 1.9.24 |
| Gradle | 8.6 / AGP 8.4.0 |
| JDK | 17 |
| Node.js | 20 LTS |

---

## 1. How the App Starts — Entry Point Chain

When Android launches the app, execution flows through this exact chain:

```
Android OS
  │
  ▼
MainApplication.kt                   ← Application.onCreate()
  │  Initializes SoLoader, Hermes engine
  │  Registers DialerPackage (all 5 native bridge modules)
  │
  ▼
MainActivity.kt                      ← ReactActivity
  │  Sets edge-to-edge for Android 15
  │  Loads the "PhoneDialer" RN component
  │
  ▼
index.js                              ← JS entry point
  │  AppRegistry.registerComponent("PhoneDialer", () => App)
  │
  ▼
src/App.tsx                           ← Root React component
  │  Wraps everything in GestureHandlerRootView + SafeAreaProvider
  │  Creates bottom tab navigator (DialPad, Contacts, CallLogs)
  │  Shows DefaultDialerBanner if not default dialer
  │  Requests all runtime permissions on first launch
  │
  ├──▶ DialPadScreen     (initial tab)
  ├──▶ ContactsScreen
  └──▶ CallLogsScreen
```

**Where to start reading code:** `index.js` → `src/App.tsx` → screens. For native: `MainApplication.kt` → `DialerPackage.kt` → individual bridge modules.

---

## 2. Project Structure — Every File Explained

```
PhoneDialer/
│
├── index.js                          JS entry point. Registers the root component.
├── app.json                          App name config ("PhoneDialer").
├── package.json                      Dependencies and scripts.
├── tsconfig.json                     TypeScript strict mode + path aliases.
├── babel.config.js                   Reanimated plugin + module-resolver aliases.
├── metro.config.js                   Metro bundler config (default).
├── .prettierrc                       Code formatting rules.
├── .gitignore                        Ignores node_modules, builds, .env, etc.
│
├── src/                              ─── REACT NATIVE LAYER ───
│   │
│   ├── App.tsx                       Root component. Navigation + permission bootstrap.
│   │
│   ├── core/                         Shared foundation (no UI here)
│   │   ├── types.ts                  ALL TypeScript types: Contact, CallLogEntry,
│   │   │                             CallState, DialPadKey, RootTabParamList, etc.
│   │   ├── store.ts                  4 Zustand stores:
│   │   │                               useDialPadStore   — digits state
│   │   │                               useContactsStore  — contacts + sections
│   │   │                               useCallLogStore   — call log entries
│   │   │                               useActiveCallStore — live call state
│   │   └── theme.ts                  Design tokens: Colors, Typography, Spacing,
│   │                                 BorderRadius. Entire UI reskinnable from here.
│   │
│   ├── services/                     Native bridge wrappers + utilities
│   │   ├── NativeDialerRole.ts       Typed wrapper: isDefaultDialer, requestRole
│   │   ├── NativeTelecom.ts          Typed wrapper: placeCall, isValidNumber
│   │   ├── NativeContacts.ts         Typed wrapper: getContacts, getContactsCount
│   │   ├── NativeCallLog.ts          Typed wrapper: getCallLogs
│   │   ├── NativeInCall.ts           Typed wrapper + NativeEventEmitter subscription
│   │   ├── PermissionsService.ts     Batch runtime permission management
│   │   └── PhoneNumberFormatter.ts   Number formatting, duration, relative time
│   │
│   ├── hooks/                        React hooks (data fetching + state)
│   │   ├── useContacts.ts            Paginated fetch, debounced search, infinite scroll
│   │   ├── useCallLogs.ts            Paginated fetch, type filter, infinite scroll
│   │   ├── useDialerRole.ts          Check + request default dialer role
│   │   └── usePermissions.ts         Check + batch request all permissions
│   │
│   ├── screens/                      Full-page screens (one per tab)
│   │   ├── DialPadScreen.tsx         Animated keypad, number formatting, call button
│   │   ├── ContactsScreen.tsx        SectionList, search bar, alphabetical sections
│   │   └── CallLogsScreen.tsx        FlatList, filter chips, tap-to-redial
│   │
│   └── components/                   Reusable UI pieces (all React.memo'd)
│       ├── DialPadButton.tsx         Single key with Reanimated press animation
│       ├── DialPadGrid.tsx           4x3 key layout
│       ├── ContactListItem.tsx       Contact row (avatar + name + phone)
│       ├── CallLogItem.tsx           Call log row (icon + name + time + duration)
│       ├── SearchBar.tsx             Text input with styling
│       └── PermissionGate.tsx        Shows "Grant Permission" when permission denied
│
├── android/                          ─── NATIVE ANDROID LAYER ───
│   │
│   ├── build.gradle                  Root Gradle: SDK 35, Kotlin 1.9.24, AGP 8.4.0
│   ├── settings.gradle               Includes :app module + RN native modules
│   ├── gradle.properties             JVM heap, AndroidX, Hermes, R8
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties Gradle 8.6 distribution
│   │
│   └── app/
│       ├── build.gradle              App module: namespace, signing, ProGuard, deps
│       ├── proguard-rules.pro        Keep bridge classes, Hermes, RN internals
│       │
│       └── src/main/
│           ├── AndroidManifest.xml   Permissions, intent filters, service declarations
│           │
│           ├── java/com/phonedialer/
│           │   ├── MainApplication.kt   Application class. Registers DialerPackage.
│           │   ├── MainActivity.kt       ReactActivity. Edge-to-edge setup.
│           │   │
│           │   ├── telecom/              Telecom framework integration
│           │   │   ├── DialerRoleManager.kt       RoleManager (API 29+) / fallback
│           │   │   ├── TelecomServiceManager.kt   TelecomManager.placeCall() wrapper
│           │   │   ├── OutgoingCallManager.kt     Validates + coordinates outgoing calls
│           │   │   ├── DialerConnectionService.kt ConnectionService for Telecom framework
│           │   │   └── DialerInCallService.kt     InCallService: receives ALL device calls,
│           │   │                                   foreground notification, event bridging
│           │   │
│           │   ├── contacts/
│           │   │   └── ContactsRepository.kt      Paginated ContactsContract queries
│           │   │
│           │   ├── calllogs/
│           │   │   └── CallLogRepository.kt       Paginated CallLog.Calls queries
│           │   │
│           │   └── bridge/               React Native bridge modules
│           │       ├── DialerPackage.kt            Registers all 5 modules
│           │       ├── DialerRoleModule.kt         Bridges DialerRoleManager
│           │       ├── TelecomModule.kt            Bridges OutgoingCallManager
│           │       ├── ContactsModule.kt           Bridges ContactsRepository
│           │       ├── CallLogModule.kt            Bridges CallLogRepository
│           │       └── InCallModule.kt             Bridges DialerInCallService
│           │
│           └── res/
│               ├── values/strings.xml              App name
│               ├── values/styles.xml               Theme: edge-to-edge, cutout mode
│               └── xml/network_security_config.xml Metro cleartext allowed
```

---

## 3. Architecture

### Layer Diagram

```
┌──────────────────────────────────────────────────────┐
│                    REACT NATIVE UI                    │
│                                                      │
│   Screens ──▶ Hooks ──▶ Zustand Stores               │
│      │                       │                        │
│      └───────────────────────┘                        │
│                  │                                    │
│          Native Bridge Wrappers (TS)                  │
│    NativeTelecom / NativeContacts / NativeInCall      │
│                  │                                    │
├══════════════════╪════════════════════════════════════┤
│    React Native  │  Bridge (NativeModules + Events)   │
├══════════════════╪════════════════════════════════════┤
│                  │                                    │
│          Bridge Modules (Kotlin)                      │
│    TelecomModule / ContactsModule / InCallModule      │
│                  │                                    │
│          Repositories + Managers                      │
│    ContactsRepository / CallLogRepository /           │
│    OutgoingCallManager / DialerRoleManager            │
│                  │                                    │
│          Android Framework APIs                       │
│    TelecomManager / ContactsContract / CallLog.Calls  │
│    RoleManager / ConnectionService / InCallService    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Data Flow: User Dials a Number

```
User taps digit "5"
  │
  ▼
DialPadButton.tsx ──onPress──▶ DialPadScreen.tsx
  │                               │
  │                       useDialPadStore.appendDigit("5")
  │                               │
  │                       store.digits = "...5"
  │                               │
  │                       formatPhoneNumber(digits) renders formatted display
  │
User taps green Call button
  │
  ▼
DialPadScreen.handleCall()
  │
  ├── NativeTelecom.hasCallPhonePermission()    ← checks native permission
  │     (if denied → requestPermission)
  │
  ├── NativeTelecom.isValidPhoneNumber(number)  ← native validation
  │     (if invalid → Alert)
  │
  └── NativeTelecom.placeCall(number)           ← crosses bridge
        │
        ▼
      TelecomModule.kt (Kotlin)
        │
        ▼
      OutgoingCallManager.initiateCall(number)
        │
        ├── normalizeNumber()
        ├── isValidPhoneNumber()
        ├── hasCallPhonePermission()
        │
        └── TelecomServiceManager.placeCall(number)
              │
              ▼
            TelecomManager.placeCall(uri, extras)   ← Android system call
              │
              ▼
            System Telecom Framework routes the call
              │
              ▼
            DialerInCallService.onCallAdded(call)   ← if app is default dialer
              │
              ├── Starts foreground notification
              ├── Registers Call.Callback
              └── Emits "onCallStateChanged" ──▶ React Native
```

### Data Flow: Contacts Screen Loads

```
ContactsScreen mounts
  │
  ▼
useContacts() hook
  │
  ├── checkPermission("READ_CONTACTS")
  │     (if denied → PermissionGate shows "Grant Permission" button)
  │
  └── NativeContacts.getContacts(offset=0, limit=50, query=null)
        │
        ▼
      ContactsModule.kt (Kotlin, on coroutine)
        │
        ▼
      ContactsRepository.getContacts()
        │  Runs on Dispatchers.IO
        │  SQL: SELECT ... FROM Phone LIMIT 50 OFFSET 0
        │  Uses column projection (only 5 columns)
        │  Closes cursor in finally block
        │
        ▼
      Returns List<Contact> ──▶ Arguments.createArray() ──▶ Promise.resolve()
        │
        ▼
      useContactsStore.setContacts(contacts, count)
        │
        ├── buildSections(contacts)  ← groups by first letter
        │     Returns [{title: "A", data: [...]}, {title: "B", data: [...]}, ...]
        │
        └── SectionList renders with sticky headers
              │
              User scrolls to bottom → onEndReached → loadMore()
              │  NativeContacts.getContacts(offset=50, limit=50, ...)
              │  useContactsStore.appendContacts(newBatch)
              │
              User types in search → search("john") → 300ms debounce
                 NativeContacts.getContacts(offset=0, limit=50, "john")
                 Results re-rendered as new sections
```

### Data Flow: Incoming Call (When Default Dialer)

```
Someone calls your phone
  │
  ▼
Android Telecom Framework
  │
  ▼
DialerInCallService.onCallAdded(call)         ← system binds to this service
  │
  ├── activeCalls.add(call)
  ├── call.registerCallback(callCallback)
  ├── promoteToForegroundIfNeeded()            ← shows "Call in progress" notification
  │     ServiceCompat.startForeground(
  │       ..., FOREGROUND_SERVICE_TYPE_PHONE_CALL)
  │
  └── emitCallStateToReactNative(call, RINGING)
        │
        ▼
      RCTDeviceEventEmitter.emit("onCallStateChanged", {
        phoneNumber: "+1234567890",
        state: "RINGING",
        callIndex: 0
      })
        │
        ▼
      NativeInCall.ts: InCallEventEmitter listener fires
        │
        ▼
      useActiveCallStore.setCallState("+1234567890", "RINGING")
        │
        ▼
      In-call UI would render (not yet built — extension point)

User answers via InCallModule:
  InCallModule.answerCall() → DialerInCallService.answerCall()
    → activeCalls[0].answer(0) → state changes to ACTIVE

Call ends:
  DialerInCallService.onCallRemoved(call)
    → unregister callback
    → emit "onCallRemoved"
    → stopForeground (if no more calls)
```

### Data Flow: Setting as Default Dialer

```
App.tsx renders DefaultDialerBanner
  │
  ├── useDialerRole() → NativeDialerRole.isDefaultDialer()
  │     │
  │     ▼
  │   DialerRoleModule.kt → DialerRoleManager.isDefaultDialer()
  │     │
  │     ▼
  │   TelecomManager.defaultDialerPackage == "com.phonedialer" ?
  │     │
  │     └── false → banner shows
  │
  User taps banner → requestRole()
    │
    ▼
  NativeDialerRole.requestDefaultDialerRole()
    │
    ▼
  DialerRoleModule.kt → DialerRoleManager.requestDefaultDialerRole(activity)
    │
    ├── API 29+: RoleManager.createRequestRoleIntent(ROLE_DIALER)
    │   └── activity.startActivityForResult(intent, 1001)
    │
    └── API 26-28: TelecomManager.ACTION_CHANGE_DEFAULT_DIALER intent
    │
    ▼
  System dialog: "Set Phone Dialer as your default phone app?"
    │
    User taps OK
    │
    ▼
  onActivityResult(requestCode=1001) → isDefaultDialer() → true
    │
    ▼
  Promise resolves(true) → useDialerRole.isDefault = true → banner hides
```

---

## 4. Native Module Bridge Map

Each Kotlin bridge module maps 1:1 to a TypeScript service wrapper:

```
TypeScript (src/services/)          Kotlin (bridge/)                 Kotlin (business logic)
─────────────────────────           ────────────────                 ─────────────────────────
NativeDialerRole.ts       ◄──────► DialerRoleModule.kt    ──────► DialerRoleManager.kt
NativeTelecom.ts          ◄──────► TelecomModule.kt        ──────► OutgoingCallManager.kt
                                                            ──────► TelecomServiceManager.kt
NativeContacts.ts         ◄──────► ContactsModule.kt       ──────► ContactsRepository.kt
NativeCallLog.ts          ◄──────► CallLogModule.kt        ──────► CallLogRepository.kt
NativeInCall.ts           ◄──────► InCallModule.kt         ──────► DialerInCallService.kt
```

**Every bridge module follows the same pattern:**
1. TS wrapper validates module exists, provides TypeScript interface
2. Kotlin module is thin — marshals data between RN types and Kotlin types
3. Business logic lives in the repository/manager classes
4. Coroutine scopes are cancelled in `invalidate()` to prevent leaks

---

## 5. State Management Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      Zustand Stores                              │
│                                                                  │
│  useDialPadStore          useContactsStore                       │
│  ┌──────────────┐         ┌────────────────────────┐            │
│  │ digits: ""   │         │ contacts: Contact[]     │            │
│  │ appendDigit()│         │ sections: Section[]     │            │
│  │ deleteLastDigit()      │ totalCount: number      │            │
│  │ clearAll()   │         │ isLoading: boolean      │            │
│  │ setDigits()  │         │ searchQuery: string     │            │
│  └──────────────┘         │ hasMore: boolean        │            │
│                           │ setContacts() / appendContacts()     │
│  useCallLogStore          │ setSearchQuery() / reset()           │
│  ┌──────────────┐         └────────────────────────┘            │
│  │ entries: []  │                                                │
│  │ isLoading    │         useActiveCallStore                     │
│  │ hasMore      │         ┌────────────────────────┐            │
│  │ setEntries() │         │ phoneNumber: string|null│            │
│  │ appendEntries()        │ callState: CallState    │            │
│  │ reset()      │         │ isMuted / isSpeaker     │            │
│  └──────────────┘         │ setCallState() / clearCall()         │
│                           └────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

Stores are accessible outside React via `useDialPadStore.getState()` — used in `CallLogsScreen` "Copy to Dial Pad" action.

---

## 6. Android Manifest Summary

```
Permissions                              Why
──────────────────────────────           ──────────────────────────────
CALL_PHONE                               Place outgoing calls
READ_PHONE_STATE                         Phone account awareness
READ_PHONE_NUMBERS                       Show user's own number
MANAGE_OWN_CALLS                         Self-managed call support
READ_CONTACTS                            Contacts screen
READ_CALL_LOG / WRITE_CALL_LOG           Call logs screen
INTERNET                                 Future: spam API, VoIP
FOREGROUND_SERVICE                       In-call notification
FOREGROUND_SERVICE_PHONE_CALL            Required type for API 35
POST_NOTIFICATIONS                       Android 13+ notification consent

Intent Filters on MainActivity           Why
──────────────────────────────           ──────────────────────────────
ACTION_DIAL + tel:                       "Dial this number" intents
ACTION_CALL + tel:                       "Call this number" intents
ACTION_VIEW + tel:                       Browser "tel:" links
ACTION_CALL_PRIVILEGED + tel:            Emergency / privileged calls

Services                                 Why
──────────────────────────────           ──────────────────────────────
DialerConnectionService                  Telecom framework: manage connections
  permission: BIND_TELECOM_CONNECTION_SERVICE
DialerInCallService                      Receive Call objects for ALL calls
  permission: BIND_INCALL_SERVICE
  foregroundServiceType: phoneCall
  meta-data: IN_CALL_SERVICE_UI=true
```

---

## 7. Windows 11 Development Environment Setup

Complete from-scratch setup. Every step.

### 7.1 Install Node.js 20 LTS

1. Go to https://nodejs.org/
2. Download **Windows Installer (.msi)** — LTS version
3. Run installer. Check **"Automatically install the necessary tools"** (installs Chocolatey + build tools)
4. Restart your terminal

```powershell
node --version    # v20.x.x
npm --version     # 10.x.x
```

Do NOT install Node via Windows Store. It creates path issues.

### 7.2 Install JDK 17

**Must be exactly 17.** Not 11, not 21, not 22.

1. https://www.azul.com/downloads/?version=java-17-lts&os=windows&package=jdk#zulu
2. Download **Windows x86_64 .msi installer**
3. Run installer. Check **"Set JAVA_HOME variable"**

```powershell
java -version     # openjdk version "17.x.x"
```

If you have multiple JDKs, JAVA_HOME might point to the wrong one and Gradle will fail.

### 7.3 Install Android Studio

1. https://developer.android.com/studio — download Windows .exe
2. Standard installation. Accept all licenses.

### 7.4 Configure Android SDK

Android Studio > gear icon > Settings > **Languages & Frameworks > Android SDK**

**SDK Platforms** (check "Show Package Details"):
- Android 15.0 (API 35): `Android SDK Platform 35`, a system image for emulator
- Android 14.0 (API 34): `Android SDK Platform 34` (fallback)

**SDK Tools:**
- Android SDK Build-Tools 35.0.0
- Android SDK Command-line Tools (latest)
- Android Emulator
- Android SDK Platform-Tools
- NDK (Side by side) 26.1.10909125
- **Google USB Driver** — required for Galaxy S24 Ultra connection

### 7.5 Install Samsung USB Drivers

Google's USB driver alone sometimes fails with Samsung.

1. https://developer.samsung.com/android-usb-driver
2. Download and install `SAMSUNG_USB_Driver_for_Mobile_Phones.exe`
3. Restart your computer

### 7.6 Set Environment Variables

Press **Win + R** → `sysdm.cpl` → **Advanced** → **Environment Variables**

**User variables** — create:

| Variable | Value |
|---|---|
| `ANDROID_HOME` | `C:\Users\<YOU>\AppData\Local\Android\Sdk` |
| `JAVA_HOME` | `C:\Program Files\Zulu\zulu-17` |

**Path** — add these entries in this order:

```
%ANDROID_HOME%\emulator          ← MUST be before \tools
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

Close ALL terminals and reopen.

```powershell
echo $env:ANDROID_HOME    # C:\Users\<YOU>\AppData\Local\Android\Sdk
echo $env:JAVA_HOME       # C:\Program Files\Zulu\zulu-17
adb --version             # Android Debug Bridge version...
java -version             # openjdk version "17.x.x"
```

### 7.7 Windows-Specific Configuration

**Enable long paths** (PowerShell as Admin):
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```
Restart after.

**PowerShell execution policy** (PowerShell as Admin):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows Defender exclusions** (without these, builds take 3-5x longer):
Windows Security > Virus & threat protection > Manage settings > Exclusions > Add:
- Your project folder
- `%ANDROID_HOME%`
- `%USERPROFILE%\.gradle`
- `%USERPROFILE%\AppData\Local\Temp`

**Install Watchman** (better file watching):
```powershell
choco install watchman
```

### 7.8 Create Emulator

Android Studio > Tools > Device Manager > Create Virtual Device > Pixel 8 > API 35 image > Finish

**AMD CPU:** Enable "Windows Hypervisor Platform" in Turn Windows Features on or off. Restart.
**Intel CPU:** HAXM should be installed automatically. If Hyper-V is enabled, it conflicts with HAXM — disable Hyper-V or use WHPX instead.

---

## 8. Project Setup

### 8.1 Initialize

```powershell
npx react-native@0.73.4 init PhoneDialer --version 0.73.4
cd PhoneDialer
```

Use a SHORT path like `C:\Dev\PhoneDialer`. Deep paths cause Gradle failures on Windows.

### 8.2 Overlay source files

Copy everything from this repo into the generated project:
- All root config files (`package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `index.js`, `app.json`)
- Entire `src\` directory
- All `android\` config files (`build.gradle`, `settings.gradle`, `gradle.properties`, `gradle\wrapper\gradle-wrapper.properties`)
- `android\app\build.gradle`, `android\app\proguard-rules.pro`
- `android\app\src\main\AndroidManifest.xml`
- All Kotlin files into `android\app\src\main\java\com\phonedialer\` (delete existing Java files)
- Resource files into `android\app\src\main\res\`

### 8.3 Install dependencies

```powershell
npm install
npm install babel-plugin-module-resolver
```

### 8.4 Create local.properties

```powershell
echo "sdk.dir=C:\\Users\\<YOU>\\AppData\\Local\\Android\\Sdk" > android\local.properties
```

### 8.5 Gradle sync

Open `android\` in Android Studio. Wait for sync. If it fails: verify JAVA_HOME, ANDROID_HOME, then File > Invalidate Caches / Restart.

---

## 9. Running on Emulator

Terminal 1:
```powershell
npx react-native start
```

Terminal 2:
```powershell
npx react-native run-android
```

Grant all permissions. Tap banner to set as default dialer.

---

## 10. Running on Galaxy S24 Ultra with Debugger

### 10.1 Enable Developer Options

Settings > About phone > Software information > **tap "Build number" 7 times**

### 10.2 Enable USB Debugging

Settings > Developer options > **USB debugging** ON. Also enable **Stay awake**.

### 10.3 Connect via USB

Use the cable that came with the S24 Ultra (data cable). Plug in. On the phone:
1. Notification: "USB connected" → tap → change to **File transfer**
2. Dialog: "Allow USB debugging?" → check **Always allow** → Allow

```powershell
adb devices
# RFXXXXXXXX    device
```

If `unauthorized`: unplug/replug, check phone for the Allow dialog.
If nothing: try different USB port. Check Device Manager for driver issues.

### 10.4 Connect Metro

```powershell
adb reverse tcp:8081 tcp:8081
```

Run this every time you reconnect USB.

### 10.5 Build and install

```powershell
npx react-native start                    # terminal 1
npx react-native run-android              # terminal 2
```

Target specific device if emulator is also running:
```powershell
npx react-native run-android --deviceId=RFXXXXXXXX
```

### 10.6 Grant permissions

Grant ALL dialogs: Phone, Contacts, Call Log, Phone State, Notifications.
If missed: Settings > Apps > Phone Dialer > Permissions.

### 10.7 Debugging

**JS debugging (Chrome DevTools):**
```powershell
adb shell input keyevent 82              # opens RN dev menu on phone
```
Tap "Open Debugger" → Chrome opens → F12 for DevTools.

**Kotlin debugging (Android Studio):**
1. Open `android\` in Android Studio
2. Select S24 Ultra from device dropdown
3. Set breakpoints in Kotlin files
4. Click Debug (bug icon) — attaches to running app

**Logcat:**
```powershell
adb logcat --pid=$(adb shell pidof com.phonedialer)
```

Filter by tag:
```powershell
adb logcat -s DialerInCallService:V OutgoingCallManager:V ContactsModule:V
```

**Live reload:** Save any file → app auto-refreshes.

### 10.8 Wireless debugging (no cable)

With USB connected first:
1. Phone: Settings > Developer options > Wireless debugging > ON
2. Tap Wireless debugging > Pair device with pairing code
3. In PowerShell:
```powershell
adb pair <IP>:<PAIRING_PORT>           # enter 6-digit code
adb connect <IP>:<WIRELESS_DEBUG_PORT>  # different port than pairing
```
4. Unplug USB. `adb devices` still shows phone.

### 10.9 Release APK

```powershell
cd android
.\gradlew.bat assembleRelease
cd ..
adb install android\app\build\outputs\apk\release\app-release.apk
```

Windows: always `.\gradlew.bat`, never `./gradlew`.

---

## 11. Samsung Galaxy S24 Ultra / One UI 7 Notes

| Topic | Detail |
|---|---|
| Default dialer switch | One UI may show extra confirmation dialogs beyond stock Android |
| Edge panels | Edge swipe gestures may overlap with app UI. `singleTask` launch mode mitigates. |
| Samsung DeX | App runs in resizable window on external monitor. Layout will work but not optimized. |
| Notifications | `NotificationCompat` delegates styling to One UI — looks correct automatically |
| Call & Text on Other Devices | Can conflict with InCallService. Disable during development: Settings > Connected devices |
| Secure Folder | Contacts inside Secure Folder are invisible to third-party apps (by design) |
| Battery optimization | One UI kills background services aggressively. Set to Unrestricted: Settings > Apps > Phone Dialer > Battery |
| Display cutout | `windowLayoutInDisplayCutoutMode=shortEdges` handles the punch-hole camera |

---

## 12. Safety

### Revert to Samsung Phone App

**Settings:** Settings > Apps > Default apps > Phone app > select "Phone"

**ADB:**
```powershell
adb shell cmd role remove-role-holder android.app.role.DIALER com.phonedialer
```

**Uninstall:**
```powershell
adb uninstall com.phonedialer
```

### If Incoming Calls Stop Working

1. Revert to Samsung Phone (above)
2. Restart phone (power + volume down)
3. Verify Samsung Phone is default

### Development Safety Rules

- Use emulator for most development. Deploy to S24 Ultra only for hardware testing.
- Never uninstall Samsung Phone app.
- Only set as default dialer when specifically testing that feature.
- If app crashes on launch, revert via ADB before debugging.

---

## 13. Troubleshooting — Windows

| Problem | Fix |
|---|---|
| `'adb' is not recognized` | ANDROID_HOME or Path wrong. Verify: `Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe"` |
| Wrong JDK (build fails with "unsupported class file version") | `java -version` must show 17. Fix JAVA_HOME. Restart all terminals. |
| `AAPT2` / path too long | Move project to `C:\Dev\PhoneDialer`. |
| `EPERM: operation not permitted` | Windows Defender locking files. Add exclusions (7.7). |
| Build takes 20+ minutes | Add Defender exclusions. Already set `Xmx4096m` in gradle.properties. |
| `Unable to load script` / white screen | `adb reverse tcp:8081 tcp:8081`. Ensure Metro is running. |
| `adb devices` → `offline` | Unplug/replug. Developer options > Revoke USB debugging authorizations > replug > Allow. |
| Emulator won't start (HAXM error) | Disable Hyper-V, or enable Windows Hypervisor Platform for AMD. |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | `adb uninstall com.phonedialer` then rebuild. |
| `.\gradlew` fails | Use `.\gradlew.bat` on Windows. |

---

## 14. Troubleshooting — General

| Problem | Fix |
|---|---|
| RoleManager not working | Requires API 29+. S24 Ultra on API 35 is fine. Old emulators use fallback. |
| CALL_PHONE not triggering | Check permissions. Check logcat. Number must be 3-15 digits. |
| Contacts empty | Permission granted? Contacts exist on device? Secure Folder contacts are hidden. |
| Metro issues | `npx react-native start --reset-cache`. Port conflict: `--port 8082` + `adb reverse tcp:8082 tcp:8082`. |

---

## 15. Extension Points

```
Feature              What to Build                                Where
───────              ─────────────                                ─────
Call Screening       DialerCallScreeningService.kt                telecom/
                     extends CallScreeningService
                     + BIND_SCREENING_SERVICE in manifest

Spam Detection       SpamRepository.kt (SQLite or API)            new package
                     SpamModule.kt bridge
                     Indicators in CallLogItem.tsx

Call Recording       CallRecordingManager.kt (MediaRecorder)      telecom/
                     Start/stop via InCallService
                     Check local recording consent laws

In-Call UI           InCallScreen.tsx                              screens/
                     Subscribe to onCallStateChanged events
                     Use InCallModule for hold/mute/speaker/end
                     Show as overlay during active calls

VoIP                 SIP/oRTP integration in ConnectionService    telecom/
                     AudioManager for routing
                     Network quality monitoring
```

---

## 16. Production Reality

### Why React Native Dialer is Risky

- **Services run without UI.** InCallService/ConnectionService run when no Activity exists. JS context may not be alive.
- **Bridge latency.** 5-15ms per message. System expects InCallService to respond in milliseconds.
- **Emergency calls.** If your default dialer crashes, user cannot call 911 until Android falls back.
- **Lifecycle complexity.** Must work foregrounded, backgrounded, process-killed, locked, and during boot.

### Native vs. React Native

| | React Native | Kotlin Native |
|---|---|---|
| InCallService | Fragile | First-class |
| Background calls | Headless JS or Kotlin fallback | Native services |
| Emergency reliability | JS-dependent | OS-level |
| System integration | Bridge overhead | Direct API |

### What Google/Samsung Dialer Has That You Don't

Carrier integration (VoLTE, VoWiFi), spam database from billions of users, on-device call screening AI, multi-SIM support, OEM testing, emergency protocols, full accessibility, battery exemptions.

### Recommendation

**Business phone system / CRM dialer / niche product:** Viable with RN + Kotlin.
**General-purpose Google Dialer replacement:** Use Kotlin + Jetpack Compose.

The native layer in this codebase is already pure Kotlin and can be extracted into a fully-native app.
