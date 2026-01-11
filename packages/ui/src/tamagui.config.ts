import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

console.log("Creating Tamagui config...");
export const tamaguiConfig = createTamagui(config);
console.log("Tamagui config created successfully");

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
