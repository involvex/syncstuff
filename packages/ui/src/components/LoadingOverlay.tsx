import { YStack } from "../Layouts";
import { Spinner } from "../Spinner";
import { Text } from "../Typography";

export interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div className="flex flex-col absolute inset-0 bg-black/50 z-50 items-center justify-center">
      <YStack className="items-center bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 gap-4">
        <Spinner size="large" />
        <Text className="font-bold text-lg">{message}</Text>
      </YStack>
    </div>
  );
}
