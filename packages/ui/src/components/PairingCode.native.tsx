import React from "react";
import { Stack, styled, Text, XStack } from "tamagui";
export interface PairingCodeProps {
  code: string;
}
const CodeDigit = styled(Stack, {
  width: 40,
  height: 50,
  backgroundColor: "$background",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: "$2",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: "$1",
});
export function PairingCode({ code }: PairingCodeProps) {
  const digits = code.split("");
  return (
    <XStack justifyContent="center" padding="$4">
      {digits.map((digit, index) => (
        <CodeDigit key={index}>
          <Text fontSize="$6" fontWeight="bold">
            {digit}
          </Text>
        </CodeDigit>
      ))}
    </XStack>
  );
}
