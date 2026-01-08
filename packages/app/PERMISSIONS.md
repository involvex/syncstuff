# Android Permissions Documentation

This document explains all permissions requested by the SyncStuff Android app and why they're needed.

## Network & Connectivity

### `INTERNET`

**Purpose**: Core functionality  
**Usage**: Required for all network operations including API calls, WebRTC connections, and cloud sync  
**Request Type**: Install-time (automatic)

### `ACCESS_NETWORK_STATE`

**Purpose**: Network monitoring  
**Usage**: Check network connectivity status to optimize sync and transfers  
**Request Type**: Install-time (automatic)

### `ACCESS_WIFI_STATE`

**Purpose**: Wi-Fi information  
**Usage**: Detect Wi-Fi connections for local network device discovery  
**Request Type**: Install-time (automatic)

### `CHANGE_WIFI_MULTICAST_STATE`

**Purpose**: mDNS discovery  
**Usage**: Enable multicast for local device discovery using mDNS protocol  
**Request Type**: Install-time (automatic)

## Bluetooth

### `BLUETOOTH` & `BLUETOOTH_ADMIN` (Android ≤ 11)

**Purpose**: Legacy Bluetooth support  
**Usage**: Bluetooth device scanning and file transfer on Android 11 and below  
**Request Type**: Install-time (automatic)  
**Max SDK**: 30

### `BLUETOOTH_SCAN` (Android ≥ 12)

**Purpose**: Bluetooth device discovery  
**Usage**: Scan for nearby Bluetooth devices for file sharing and pairing  
**Request Type**: Runtime (user must grant)  
**Note**: Flagged with `neverForLocation` to indicate we don't use Bluetooth for location tracking

### `BLUETOOTH_CONNECT` (Android ≥ 12)

**Purpose**: Bluetooth connections  
**Usage**: Connect to and communicate with paired Bluetooth devices  
**Request Type**: Runtime (user must grant)

### `BLUETOOTH_ADVERTISE` (Android ≥ 12)

**Purpose**: Bluetooth advertising  
**Usage**: Make device discoverable to other devices for pairing  
**Request Type**: Runtime (user must grant)

## Location

### `ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION`

**Purpose**: Required for Bluetooth scanning on Android 12+  
**Usage**: Android requires location permission to use Bluetooth scanning APIs  
**Request Type**: Runtime (user must grant)  
**Note**: We don't actually use location data; this is a platform requirement for Bluetooth

## Notifications

### `POST_NOTIFICATIONS` (Android ≥ 13)

**Purpose**: Show notifications  
**Usage**: Notify users about transfer completion, device connections, and sync status  
**Request Type**: Runtime (user must grant)  
**User Control**: Users can disable in system settings

## Camera

### `CAMERA`

**Purpose**: QR code scanning  
**Usage**: Scan QR codes for quick device pairing  
**Request Type**: Runtime (user must grant)

### `FLASHLIGHT`

**Purpose**: Camera flash  
**Usage**: Enable flashlight during QR code scanning in low light  
**Request Type**: Install-time (automatic)

## File Access

### `READ_EXTERNAL_STORAGE` (Android ≤ 12)

**Purpose**: Read files  
**Usage**: Access files for transfer and backup  
**Request Type**: Runtime (user must grant)  
**Max SDK**: 32

### `WRITE_EXTERNAL_STORAGE` (Android ≤ 10)

**Purpose**: Save files  
**Usage**: Save received files to device storage  
**Request Type**: Runtime (user must grant)  
**Max SDK**: 29  
**Note**: Replaced by Scoped Storage on Android 11+

## Background Operations

### `WAKE_LOCK`

**Purpose**: Keep device awake  
**Usage**: Prevent device from sleeping during file transfers  
**Request Type**: Install-time (automatic)

### `FOREGROUND_SERVICE`

**Purpose**: Background sync  
**Usage**: Run sync service in background with persistent notification  
**Request Type**: Install-time (automatic)

## Permission Request Flow

### At First Launch

1. App checks which permissions are needed
2. Shows permission rationale UI explaining why each permission is needed
3. Requests permissions one-by-one with context

### During Feature Use

- Bluetooth: Requested when user first tries to use Bluetooth file sharing
- Camera: Requested when user first tries to scan QR code
- Notifications: Requested when app first launches
- Location: Requested alongside Bluetooth permissions (Android 12+)

### Permission Denied Handling

- App provides graceful degradation
- Features requiring denied permissions are disabled with explanation
- User can manually enable in Settings if they change their mind

## Privacy Notes

- **No Location Tracking**: Despite requesting location permission, we never access location data. The permission is only required by Android for Bluetooth scanning.
- **No Background Data Collection**: Background services only sync data explicitly requested by user
- **Local-First**: Most features work without internet connection
- **Optional Cloud**: Cloud sync is opt-in and can be disabled

## Testing Permissions

To test permissions on emulator/device:

```bash
# Grant all permissions
adb shell pm grant com.involvex.syncstuff android.permission.CAMERA
adb shell pm grant com.involvex.syncstuff android.permission.ACCESS_FINE_LOCATION
adb shell pm grant com.involvex.syncstuff android.permission.BLUETOOTH_SCAN
adb shell pm grant com.involvex.syncstuff android.permission.BLUETOOTH_CONNECT
adb shell pm grant com.involvex.syncstuff android.permission.POST_NOTIFICATIONS

# Revoke all permissions
adb shell pm revoke com.involvex.syncstuff android.permission.CAMERA
# etc...

# Reset all permissions
adb shell pm reset-permissions
```
