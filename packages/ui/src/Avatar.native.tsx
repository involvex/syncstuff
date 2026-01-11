import { styled, Avatar as TAvatar } from "tamagui";
export const Avatar = styled(TAvatar, {
  name: "Avatar",
  circular: true,
  size: "$4",
});
export const AvatarImage = styled(TAvatar.Image, {
  name: "AvatarImage",
});
export const AvatarFallback = styled(TAvatar.Fallback, {
  name: "AvatarFallback",
  backgroundColor: "$background",
  justifyContent: "center",
  alignItems: "center",
});
