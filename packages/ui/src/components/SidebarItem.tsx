import "./_SidebarItem.css";
const _cn =
  "_dsp-flex _ai-stretch _fd-column _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 ";
import React from "react";
import { XStack, Text, styled, View } from "tamagui";
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
      {icon && <div className={_cn}>{icon}</div>}
      <Text fontWeight={active ? "bold" : "normal"} color={color}>
        {label}
      </Text>
    </SidebarItemFrame>
  );
}
