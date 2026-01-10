# @syncstuff/ui

Shared UI library using Tamagui.

## Usage

### Setup

Wrap your application root with `Provider`:

```tsx
import { Provider } from "@syncstuff/ui";

export default function App() {
  return <Provider>{/* Your app */}</Provider>;
}
```

### Components

Import components directly:

```tsx
import { Button, Text, Stack } from "@syncstuff/ui";

<Stack>
  <Text>Hello World</Text>
  <Button>Click me</Button>
</Stack>;
```

## Configuration

Custom configuration is in `src/tamagui.config.ts`.
Themes and animations are provided by `@tamagui/config/v3`.
