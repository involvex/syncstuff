export declare const Input: import("tamagui").TamaguiComponent<
  import("@tamagui/core").TamaDefer,
  import("react-native").TextInput,
  import("@tamagui/core").TamaguiComponentPropsBaseBase &
    import("react-native").TextInputProps &
    import("tamagui").InputExtraProps,
  import("@tamagui/core").TextStylePropsBase & {
    readonly placeholderTextColor?:
      | Omit<
          | import("tamagui").ColorTokens
          | import("@tamagui/core").ThemeValueFallbackColor,
          "unset"
        >
      | undefined;
    readonly selectionColor?:
      | Omit<
          | import("tamagui").ColorTokens
          | import("@tamagui/core").ThemeValueFallbackColor,
          "unset"
        >
      | undefined;
  },
  {
    size?: import("tamagui").SizeTokens | undefined;
    disabled?: boolean | undefined;
    unstyled?: boolean | undefined;
  },
  {
    isInput: true;
    accept: {
      readonly placeholderTextColor: "color";
      readonly selectionColor: "color";
    };
  } & import("@tamagui/core").StaticConfigPublic
>;
//# sourceMappingURL=Input.native.d.ts.map
