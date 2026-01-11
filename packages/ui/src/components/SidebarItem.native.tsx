import type React from "react";
import { styled, Text, View, XStack } from "tamagui";
export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onPress?: () => void;
}
const SidebarItemFrame = styled(XStack, {
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  borderRadius: "$4",
  space: "$3",
  alignItems: "center",
  cursor: "pointer",
  hoverStyle: {
    backgroundColor: "$backgroundHover",
  },
  pressStyle: {
    backgroundColor: "$backgroundPress",
  },
  variants: {
    active: {
      true: {
        backgroundColor: "$backgroundFocus",
      },
    },
  } as const,
});
export function SidebarItem({
  icon,
  label,
  active,
  onPress,
}: SidebarItemProps) {
  const color = active ? "$primary" : "$color";
  return (
    <SidebarItemFrame active={active} onPress={onPress}>
      {icon && <View>{icon}</View>}
      <Text color={color} fontWeight={active ? "bold" : "normal"}>
        {label}
      </Text>
    </SidebarItemFrame>
  );
}
