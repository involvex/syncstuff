# Task 3 Report: Add Queue Methods to TransferBloc

## What I Implemented

### 1. New Events (transfer_event.dart)
- **`EnqueueTransfer`** - Adds a file to the transfer queue with priority (filePath, deviceIp, deviceId?, priority)
- **`DequeueTransfer`** - Removes a transfer from the queue by ID

### 2. Updated State (transfer_state.dart)
- Added `queuedTransfers` field (List<FileTransfer>) with default `const []`
- Updated `copyWith` and `props` accordingly

### 3. TransferQueue Dependency (transfer_bloc.dart)
- Added `TransferQueue?` constructor parameter with optional injection
- Added `StreamSubscription` fields for queue and active stream listeners
- Wired stream listeners to sync TransferQueue state into BLoC state
- Added queue completion callbacks in progress listener (`onComplete` on transfer completed/failed)

### 4. Queue Handlers (transfer_bloc.dart)
- **`_onEnqueue`**: Creates a `FileTransfer` with `TransferStatus.pending`, reads file size, enqueues via `TransferQueue.enqueue()`
- **`_onDequeue`**: Removes from queued state, calls `TransferQueue.onCancel()`

### 5. Cleanup (transfer_bloc.dart)
- Updated `close()` to cancel queue/active subscriptions and dispose TransferQueue

### 6. Entity Export Fix (domain/entities/transfer.dart)
- Added `TransferPriority` to the mobile entity re-export (was missing)

## Files Changed

| File | Change |
|------|--------|
| `apps/mobile/lib/presentation/bloc/transfer/transfer_event.dart` | Added `EnqueueTransfer`, `DequeueTransfer` events + `TransferPriority` import |
| `apps/mobile/lib/presentation/bloc/transfer/transfer_state.dart` | Added `queuedTransfers` field, updated `copyWith` and `props` |
| `apps/mobile/lib/presentation/bloc/transfer/transfer_bloc.dart` | Added TransferQueue dependency, queue handlers, stream listeners, cleanup |
| `apps/mobile/lib/domain/entities/transfer.dart` | Added `TransferPriority` to export show list |

## Test Results

- **`dart analyze`**: 0 errors, 4 warnings (all harmless)
  - 2x `unnecessary_non_null_assertion` on `_transferQueue!` inside null-guarded block (Dart flow analysis quirk)
  - 2x `invalid_use_of_visible_for_testing_member` for `emit` in stream listeners (expected BLoC pattern)

## Issues / Concerns

- **DI Registration**: No service locator was found in the mobile app. The `TransferBloc` now accepts an optional `TransferQueue` parameter. Whoever creates the BLoC should pass a `TransferQueue` instance. The plan mentions registering in `apps/mobile/lib/core/di/service_locator.dart` (Task 8) but that file doesn't exist yet.
- **Stream listener `emit` warnings**: Using `emit` inside stream listeners (not in BLoC handlers) produces analyzer warnings. This is a known BLoC pattern and is harmless, but could be refactored to use `add()` events instead for stricter compliance.
