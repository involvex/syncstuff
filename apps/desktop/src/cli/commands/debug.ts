import { DebugMode } from "../../core";

export const showDebug = () => {
  if (!DebugMode.enabled) {
    return;
  }
  console.log("Debug mode enabled");
};
