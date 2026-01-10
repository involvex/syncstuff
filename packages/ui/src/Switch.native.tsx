import { Switch as TSwitch, styled } from "tamagui";

// Using explicit any type assertions to handle Bun/TypeScript module resolution quirks with Tamagui
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwitchFrame: any = styled(TSwitch, {
  name: "Switch",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwitchThumb: any = styled(TSwitch.Thumb, {
  name: "SwitchThumb",
  backgroundColor: "$background",
});

// Re-export with Thumb subcomponent
export const Switch = Object.assign(SwitchFrame, {
  Thumb: SwitchThumb,
});
