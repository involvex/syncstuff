import { resolve } from "path";

const stubPath = resolve(import.meta.dirname, "./react-native-svg-stub.js");

export function reactNativeSvgAlias() {
  return {
    name: "react-native-svg-alias",
    resolveId(source) {
      if (
        source === "react-native-svg" ||
        source.includes("react-native-svg/")
      ) {
        return stubPath;
      }
      return null;
    },
  };
}
