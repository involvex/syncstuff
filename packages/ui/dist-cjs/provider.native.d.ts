import { type TamaguiProviderProps } from "tamagui";
type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
};
export declare const useAppTheme: () => ThemeContextType;
export declare function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">): JSX.Element;
//# sourceMappingURL=provider.native.d.ts.map
