import { XStack } from "../Layouts";
import { Text } from "../Typography";

export interface PairingCodeProps {
  code: string;
}

export function PairingCode({ code }: PairingCodeProps) {
  const digits = code.split("");
  return (
    <XStack className="justify-center gap-2 p-4">
      {digits.map((digit, index) => (
        <div
          key={index}
          className="w-10 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center"
        >
          <Text className="text-xl font-bold">{digit}</Text>
        </div>
      ))}
    </XStack>
  );
}