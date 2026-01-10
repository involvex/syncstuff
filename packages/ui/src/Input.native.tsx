import { Input as TInput, styled } from "tamagui";
export const Input = styled(TInput, {
  name: "Input",
  borderWidth: 1,
  borderColor: "$borderColor",
  padding: "$3",
  borderRadius: "$4",
  focusStyle: {
    borderColor: "$borderColorFocus",
  },
});
