import type React from "react";
import { Stack, styled, Text } from "tamagui";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

export interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
}

const BadgeFrame = styled(Stack, {
  name: "StatusBadge",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  borderRadius: "$2",
  alignItems: "center",
  justifyContent: "center",

  variants: {
    status: {
      success: { backgroundColor: "$green4" },
      warning: { backgroundColor: "$yellow4" },
      error: { backgroundColor: "$red4" },
      info: { backgroundColor: "$blue4" },
      neutral: { backgroundColor: "$gray4" },
    },
  } as const,
});

const BadgeText = styled(Text, {
  fontSize: "$2",
  fontWeight: "bold",

  variants: {
    status: {
      success: { color: "$green10" },
      warning: { color: "$yellow10" },
      error: { color: "$red10" },
      info: { color: "$blue10" },
      neutral: { color: "$gray10" },
    },
  } as const,
});

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <BadgeFrame status={status}>
      <BadgeText status={status}>{children}</BadgeText>
    </BadgeFrame>
  );
}
