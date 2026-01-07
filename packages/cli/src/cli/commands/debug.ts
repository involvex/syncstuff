import type { DebugMode } from "../../core";

export const showDebug = (debugMode: DebugMode) => {
  if (!debugMode.enabled) {
    return;
  } else {
    console.log("Debug mode enabled");
  }
};
