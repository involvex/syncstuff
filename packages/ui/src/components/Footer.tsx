import { Separator } from "../Separator";
import { Text } from "../Typography";
import { XStack, YStack } from "../Layouts";

export function Footer() {
  return (
    <YStack
      className="bg-background border-t border-slate-200 dark:border-slate-800 px-4 py-8 gap-4"
    >
      <XStack className="flex-wrap justify-between gap-4">
        <YStack className="min-w-[200px] gap-2">
          <Text className="text-lg font-bold">Syncstuff</Text>
          <Text className="text-slate-500 dark:text-slate-400">
            Synchronize your files and clipboard across all your devices.
          </Text>
        </YStack>

        <XStack className="flex-wrap gap-8">
          <YStack className="gap-2">
            <Text className="font-bold">Product</Text>
            <Text>Features</Text>
            <Text>Downloads</Text>
            <Text>Premium</Text>
            <Text>Campaigns</Text>
          </YStack>

          <YStack className="gap-2">
            <Text className="font-bold">Company</Text>
            <Text>About</Text>
            <Text>Blog</Text>
            <Text>FAQ</Text>
            <Text>Contact</Text>
          </YStack>

          <YStack className="gap-2">
            <Text className="font-bold">Legal</Text>
            <Text>Privacy</Text>
            <Text>Terms</Text>
          </YStack>
        </XStack>
      </XStack>

      <Separator />

      <div className="flex flex-row justify-between items-center">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Involvex. All rights reserved.
        </Text>
        <XStack className="gap-4">{/* Social icons could go here */}</XStack>
      </div>
    </YStack>
  );
}