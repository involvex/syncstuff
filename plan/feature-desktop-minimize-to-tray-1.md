---
goal: Add "Minimize to Tray" setting for the desktop app
version: 1.0
date_created: 2026-07-25
status: 'Planned'
tags: ['feature', 'desktop', 'tray', 'settings']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Add a system tray integration to the SyncStuff desktop app with a user-configurable setting. When enabled, closing the window minimizes the app to the system tray instead of quitting. The tray icon provides a context menu with Restore, Show/Hide, and Quit actions, plus a toast notification on minimize.

## 1. Requirements & Constraints

- **REQ-001**: Add `minimizeToTray` boolean setting to SettingsBloc (default: `true`)
- **REQ-002**: When enabled, closing the window hides to system tray instead of quitting
- **REQ-003**: System tray icon with context menu: Restore, Show/Hide, Quit
- **REQ-004**: Toast notification shown when app minimizes to tray
- **REQ-005**: Setting persists via SharedPreferences
- **REQ-006**: Setting toggle appears in Settings page under a new "Behavior" section
- **CON-001**: Windows-only implementation (desktop app targets Windows)
- **CON-002**: Must use `system_tray` package for cross-platform tray support
- **CON-003**: Must use `window_manager` package for window visibility control
- **PAT-001**: Follow existing BLoC pattern for settings (event/state/bloc)
- **PAT-002**: Follow existing _SettingsTile widget pattern in settings_page.dart
- **PAT-003**: Register new service via get_it in service_locator.dart

## 2. Implementation Steps

### Implementation Phase 1: Dependencies & Service Setup

- GOAL-001: Add required packages and create SystemTrayService

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add `system_tray: ^2.0.3` and `window_manager: ^0.4.2` to `apps/desktop/pubspec.yaml` under dependencies | | |
| TASK-002 | Create `apps/desktop/lib/services/system_tray_service.dart` with SystemTrayService class that initializes tray icon, context menu, and window manager | | |
| TASK-003 | Register SystemTrayService as lazy singleton in `apps/desktop/lib/core/di/service_locator.dart` | | |

### Implementation Phase 2: Settings BLoC Updates

- GOAL-002: Add minimizeToTray setting to the BLoC layer

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Add `minimizeToTrayEnabled` field to `SettingsState` with default `true`, update `copyWith` and `props` in `apps/desktop/lib/presentation/bloc/settings/settings_state.dart` | | |
| TASK-005 | Add `ToggleMinimizeToTray` event class to `apps/desktop/lib/presentation/bloc/settings/settings_event.dart` | | |
| TASK-006 | Add `_keyMinimizeToTray` constant, `_onToggleMinimizeToTray` handler, and load logic in `apps/desktop/lib/presentation/bloc/settings/settings_bloc.dart` | | |

### Implementation Phase 3: Settings UI

- GOAL-003: Add minimize to tray toggle in settings page

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Add new "Behavior" section with minimize to tray toggle in `apps/desktop/lib/presentation/pages/settings_page.dart`, placed between "Network" and "Notifications" sections | | |

### Implementation Phase 4: Main App Integration

- GOAL-004: Initialize tray and handle window close events

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Update `apps/desktop/lib/main.dart` to initialize SystemTrayService after widget binding, and set up window close interception based on setting | | |
| TASK-009 | Update `apps/desktop/lib/app.dart` to pass SettingsBloc state to SystemTrayService for dynamic close behavior | | |

## 3. Alternatives

- **ALT-001**: Use `bitsdojo_window` instead of `window_manager` — rejected because `window_manager` is more actively maintained and has simpler API for hide/show
- **ALT-002**: Use native Win32 API via FFI for tray — rejected because `system_tray` provides cross-platform abstraction and simpler implementation
- **ALT-003**: Implement tray in C++ runner code — rejected because Dart-level implementation is easier to maintain and test

## 4. Dependencies

- **DEP-001**: `system_tray: ^2.0.3` — Flutter plugin for system tray icon and menu
- **DEP-002**: `window_manager: ^0.4.2` — Flutter plugin for window management (hide/show/minimize)

## 5. Files

- **FILE-001**: `apps/desktop/pubspec.yaml` — Add system_tray and window_manager dependencies
- **FILE-002**: `apps/desktop/lib/services/system_tray_service.dart` — New file: SystemTrayService class
- **FILE-003**: `apps/desktop/lib/core/di/service_locator.dart` — Register SystemTrayService
- **FILE-004**: `apps/desktop/lib/presentation/bloc/settings/settings_state.dart` — Add minimizeToTrayEnabled field
- **FILE-005**: `apps/desktop/lib/presentation/bloc/settings/settings_event.dart` — Add ToggleMinimizeToTray event
- **FILE-006**: `apps/desktop/lib/presentation/bloc/settings/settings_bloc.dart` — Add handler and persistence
- **FILE-007**: `apps/desktop/lib/presentation/pages/settings_page.dart` — Add Behavior section with toggle
- **FILE-008**: `apps/desktop/lib/main.dart` — Initialize tray service and window close handling
- **FILE-009**: `apps/desktop/lib/app.dart` — Connect settings to tray service

## 6. Testing

- **TEST-001**: Manual test: Enable minimize to tray, close window, verify app hides to tray
- **TEST-002**: Manual test: Click tray icon, verify context menu appears with Restore/Quit
- **TEST-003**: Manual test: Select Restore from tray menu, verify window reappears
- **TEST-004**: Manual test: Select Quit from tray menu, verify app exits
- **TEST-005**: Manual test: Disable minimize to tray, close window, verify app quits normally
- **TEST-006**: Manual test: Verify setting persists after app restart

## 7. Risks & Assumptions

- **RISK-001**: `system_tray` package may require Windows-specific configuration (tray icon format)
- **RISK-002**: Window close interception may conflict with existing Flutter lifecycle handling
- **ASSUMPTION-001**: The existing `app_icon.ico` in `windows/runner/resources/` can be used as tray icon
- **ASSUMPTION-002**: Desktop app is Windows-only (no macOS/Linux tray implementation needed)

## 8. Related Specifications / Further Reading

- [system_tray package documentation](https://pub.dev/packages/system_tray)
- [window_manager package documentation](https://pub.dev/packages/window_manager)
- Existing settings implementation: `apps/desktop/lib/presentation/bloc/settings/`
