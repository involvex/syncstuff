export declare const Spinner: import("tamagui").TamaguiComponent<
  import("@tamagui/core").TamaDefer,
  any,
  import("@tamagui/core").TamaguiComponentPropsBaseBase &
    Omit<
      import("@tamagui/core").GetFinalProps<
        import("@tamagui/core").RNTamaguiViewNonStyleProps,
        import("@tamagui/core").StackStyleBase,
        {
          elevation?: number | import("tamagui").SizeTokens | undefined;
          inset?:
            | number
            | import("tamagui").SizeTokens
            | {
                top?: number;
                bottom?: number;
                left?: number;
                right?: number;
              }
            | null
            | undefined;
          fullscreen?: boolean | undefined;
        }
      >,
      "children"
    > & {
      size?: "small" | "large";
      color?:
        | (
            | import("tamagui").ColorTokens
            | import("tamagui").ThemeTokens
            | (string & {})
          )
        | null;
    } & import("react").RefAttributes<any>,
  import("@tamagui/core").StackStyleBase,
  {},
  import("@tamagui/core").StaticConfigPublic
>;
//# sourceMappingURL=Spinner.native.d.ts.map
