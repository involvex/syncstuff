# Capacitor Plugin Issues

This document tracks known issues with Capacitor plugins that are outside our control.

## @capacitor/filesystem@8.0.0

### Deprecation Warning - downloadFile()

**Status**: Plugin-level issue, not our code

**Warning Message**:

```
w: file:///D:/repos/ionic/syncstuff/node_modules/.bun/@capacitor+filesystem@8.0.0+15e98482558ccfe6/node_modules/@capacitor/filesystem/android/src/main/kotlin/com/capacitorjs/plugins/filesystem/FilesystemPlugin.kt:335:31 'fun downloadFile(call: PluginCall): Unit' is deprecated. Use @capacitor/file-transfer plugin instead.
```

**Impact**: None - this is a warning from the plugin's internal code, not our usage

**Our Code**: We only use non-deprecated methods:

- `Filesystem.readFile()`
- `Filesystem.writeFile()`
- `Filesystem.appendFile()`
- `Filesystem.stat()`
- `Filesystem.deleteFile()`

**Resolution**: Wait for Capacitor to release updated plugin or migrate specific download features to `@capacitor/file-transfer` if needed in future

### Java Type Mismatch Warning

**Status**: Plugin-level issue

**Warning Message**:

```
w: file:///D:/repos/ionic/syncstuff/node_modules/.bun/@capacitor+filesystem@8.0.0+15e98482558ccfe6/node_modules/@capacitor/filesystem/android/src/main/kotlin/com/capacitorjs/plugins/filesystem/LegacyFilesystemImplementation.kt:66:29 Java type mismatch: inferred type is 'String?', but 'String' was expected.
```

**Impact**: None - compilation succeeds despite warning

**Resolution**: Wait for Capacitor team to fix in future release

## Build Configuration

### flatDir Repository Warning

**Status**: Can be resolved

**Warning Message**:

```
Using flatDir should be avoided because it doesn't support any meta-data formats.
```

**Location**: `packages/app/android/app/build.gradle:27-30`

**Impact**: Minor - build still works but not following best practices

**Proposed Fix**: Remove `flatDir` if not needed, or migrate to proper Maven repository if Capacitor plugins require it

**Action**: Monitor if removing `flatDir` breaks any Capacitor plugins. If plugins work without it, remove this section.
