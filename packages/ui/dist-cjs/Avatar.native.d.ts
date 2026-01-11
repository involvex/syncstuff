export declare const Avatar: import("tamagui").TamaguiComponent<
  import("@tamagui/core").TamaDefer,
  import("tamagui").TamaguiElement,
  import("@tamagui/core").TamaguiComponentPropsBaseBase &
    Omit<
      import("@tamagui/core").RNTamaguiViewNonStyleProps,
      | "size"
      | "elevation"
      | keyof import("@tamagui/core").StackStyleBase
      | "fullscreen"
      | "circular"
      | "hoverTheme"
      | "pressTheme"
      | "focusTheme"
      | "elevate"
      | "bordered"
      | "transparent"
      | "backgrounded"
      | "radiused"
      | "padded"
      | "chromeless"
    > &
    import("@tamagui/core").WithThemeValues<
      import("@tamagui/core").StackStyleBase
    > & {
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
      size?: number | import("tamagui").SizeTokens | undefined;
      fullscreen?: boolean | undefined;
      circular?: boolean | undefined;
      hoverTheme?: boolean | undefined;
      pressTheme?: boolean | undefined;
      focusTheme?: boolean | undefined;
      elevate?: boolean | undefined;
      bordered?: number | boolean | undefined;
      transparent?: boolean | undefined;
      backgrounded?: boolean | undefined;
      radiused?: boolean | undefined;
      padded?: boolean | undefined;
      chromeless?: boolean | "all" | undefined;
    } & import("@tamagui/core").WithShorthands<
      import("@tamagui/core").WithThemeValues<
        import("@tamagui/core").StackStyleBase
      >
    > &
    import("@tamagui/core").WithPseudoProps<
      import("@tamagui/core").WithThemeValues<
        import("@tamagui/core").StackStyleBase
      > & {
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
        size?: number | import("tamagui").SizeTokens | undefined;
        fullscreen?: boolean | undefined;
        circular?: boolean | undefined;
        hoverTheme?: boolean | undefined;
        pressTheme?: boolean | undefined;
        focusTheme?: boolean | undefined;
        elevate?: boolean | undefined;
        bordered?: number | boolean | undefined;
        transparent?: boolean | undefined;
        backgrounded?: boolean | undefined;
        radiused?: boolean | undefined;
        padded?: boolean | undefined;
        chromeless?: boolean | "all" | undefined;
      } & import("@tamagui/core").WithShorthands<
          import("@tamagui/core").WithThemeValues<
            import("@tamagui/core").StackStyleBase
          >
        >
    > &
    import("@tamagui/core").WithMediaProps<
      import("@tamagui/core").WithThemeShorthandsAndPseudos<
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
          size?: number | import("tamagui").SizeTokens | undefined;
          fullscreen?: boolean | undefined;
          circular?: boolean | undefined;
          hoverTheme?: boolean | undefined;
          pressTheme?: boolean | undefined;
          focusTheme?: boolean | undefined;
          elevate?: boolean | undefined;
          bordered?: number | boolean | undefined;
          transparent?: boolean | undefined;
          backgrounded?: boolean | undefined;
          radiused?: boolean | undefined;
          padded?: boolean | undefined;
          chromeless?: boolean | "all" | undefined;
        }
      >
    > &
    import("react").RefAttributes<import("tamagui").TamaguiElement>,
  import("@tamagui/core").StackStyleBase,
  {},
  import("@tamagui/core").StaticConfigPublic
>;
export declare const AvatarImage: import("tamagui").TamaguiComponent<
  import("@tamagui/core").TamaDefer,
  import("tamagui").TamaguiElement,
  import("@tamagui/core").TamaguiComponentPropsBaseBase &
    Partial<import("tamagui").ImageProps> & {
      onLoadingStatusChange?: (
        status: "error" | "idle" | "loading" | "loaded",
      ) => void;
    } & import("react").RefAttributes<import("tamagui").TamaguiElement>,
  import("@tamagui/core").StackStyleBase,
  {},
  import("@tamagui/core").StaticConfigPublic
>;
export declare const AvatarFallback: import("tamagui").TamaguiComponent<
  import("@tamagui/core").TamaDefer,
  import("tamagui").TamaguiElement,
  import("@tamagui/core").TamaguiComponentPropsBaseBase &
    Omit<
      import("@tamagui/core").RNTamaguiViewNonStyleProps,
      "elevation" | keyof import("@tamagui/core").StackStyleBase | "fullscreen"
    > &
    import("@tamagui/core").WithThemeValues<
      import("@tamagui/core").StackStyleBase
    > & {
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
    } & import("@tamagui/core").WithShorthands<
      import("@tamagui/core").WithThemeValues<
        import("@tamagui/core").StackStyleBase
      >
    > &
    import("@tamagui/core").WithPseudoProps<
      import("@tamagui/core").WithThemeValues<
        import("@tamagui/core").StackStyleBase
      > & {
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
      } & import("@tamagui/core").WithShorthands<
          import("@tamagui/core").WithThemeValues<
            import("@tamagui/core").StackStyleBase
          >
        >
    > &
    import("@tamagui/core").WithMediaProps<
      import("@tamagui/core").WithThemeShorthandsAndPseudos<
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
      >
    > & {
      delayMs?: number;
    } & import("react").RefAttributes<import("tamagui").TamaguiElement>,
  import("@tamagui/core").StackStyleBase,
  {},
  import("@tamagui/core").StaticConfigPublic
>;
//# sourceMappingURL=Avatar.native.d.ts.map
