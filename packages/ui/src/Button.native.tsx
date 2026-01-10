import { Button as TButton, styled } from "tamagui";
export const Button = styled(TButton, {
  name: "Button",
  backgroundColor: "$background",
  color: "$color",
  hoverStyle: {
    backgroundColor: "$backgroundHover",
  },
  pressStyle: {
    backgroundColor: "$backgroundPress",
  },
});
