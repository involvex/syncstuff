import { YStack, XStack } from "../Layouts";
import { Text } from "../Typography";

export interface TransferProgressProps {
  fileName: string;
  progress: number; // 0 to 100
  speed?: string;
  remainingTime?: string;
}

export function TransferProgress({
  fileName,
  progress,
  speed,
  remainingTime,
}: TransferProgressProps) {
  return (
    <YStack
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 gap-2"
    >
      <XStack className="justify-between">
        <Text className="font-bold truncate max-w-[70%]">{fileName}</Text>
        <Text className="text-sm">{Math.round(progress)}%</Text>
      </XStack>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out" 
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <XStack className="justify-between">
        {speed && <Text className="text-xs text-slate-500 dark:text-slate-400">{speed}</Text>}
        {remainingTime && <Text className="text-xs text-slate-500 dark:text-slate-400">{remainingTime}</Text>}
      </XStack>
    </YStack>
  );
}