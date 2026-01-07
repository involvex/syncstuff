import Version from "../../../package.json";

export function showversion() {
  console.log(`@syncstuff/cli ${Version.version}`);

  //   return Version.version;
}
