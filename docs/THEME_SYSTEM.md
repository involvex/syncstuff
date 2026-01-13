# SyncStuff Theme System Documentation

## Overview

The SyncStuff theme system provides a comprehensive, consistent approach to theming across the entire web application. It combines CSS variables, Tailwind CSS, and custom components to create a flexible and maintainable design system.

## Theme Architecture

### 1. CSS Variables

The foundation of the theme system is built on CSS variables defined in `apps/web/app/styles/theme.css`. These variables are organized into logical groups:

#### Color Variables

```css
--background-color: Main background color
--background-hover-color: Background hover state
--background-focus-color: Background focus state
--background-subtle-color: Subtle background variations

--surface-color: Surface/container background
--surface-container-color: Container surfaces
--surface-variant-color: Variant surfaces
--surface-hover-color: Surface hover state
--surface-active-color: Surface active/pressed state

--on-background-color: Text on background
--on-surface-color: Text on surfaces
--on-surface-variant-color: Text on variant surfaces

--color-primary: Primary brand color
--color-secondary: Secondary brand color
--color-tertiary: Tertiary brand color
--color-subtitle: Subtitle/text secondary
--color-disabled: Disabled state color
```

#### Border Variables

```css
--border-color: Default border color
--border-focus-color: Focused border color
--border-error-color: Error state border color
--outline-variant-color: Outline variant color
```

### 2. Tailwind Configuration

The Tailwind configuration (`apps/web/tailwind.config.ts`) extends the default theme with our custom colors and utilities:

```typescript
extend: {
  colors: {
    primary: { DEFAULT, foreground, container, onContainer, fixed, onFixed, light, dark },
    secondary: { DEFAULT, foreground, container, onContainer, fixed, onFixed, light, dark },
    // ... other color palettes
    background: { DEFAULT, hover, focus, subtle },
    surface: { DEFAULT, container, variant, hover, active },
    // ... text and border colors
  },
  // Background, text, and border utilities
  // Animation utilities
}
```

### 3. Theme Switching

The theme switching mechanism is implemented in `apps/web/app/hooks/useTheme.ts`:

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage or prefer system preference
  });
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  
  return { theme, toggleTheme };
}
```

## Using the Theme System

### 1. CSS Variable Usage

Use CSS variables directly in your styles:

```css
.my-component {
  background-color: var(--background-color);
  color: var(--on-background-color);
  border: 1px solid var(--border-color);
}

.my-component:hover {
  background-color: var(--background-hover-color);
}
```

### 2. Tailwind Utility Classes

Use the extended Tailwind classes:

```html
<div class="bg-background text-on-background border-border">
  <!-- Content -->
</div>

<button class="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>
```

### 3. Component Library

The UI component library (`apps/web/app/components/ui/`) provides pre-styled components that automatically adapt to the current theme:

```tsx
import { Button, Card, Input } from "~/components/ui";

function MyComponent() {
  return (
    <Card bordered elevate>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button variant="primary">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Component Library

### Button Component

```tsx
<Button 
  variant="default|destructive|outline|secondary|ghost|link"
  size="default|sm|lg|icon"
  isLoading={boolean}
  disabled={boolean}
>
  Button Text
</Button>
```

**Variants:**
- `default`: Primary action button
- `destructive`: Dangerous actions (red)
- `outline`: Secondary actions
- `secondary`: Alternative primary actions
- `ghost`: Subtle actions
- `link`: Text-style buttons

### Card Component

```tsx
<Card bordered elevate hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer */}
  </CardFooter>
</Card>
```

**Props:**
- `bordered`: Add border to card
- `elevate`: Add shadow and hover elevation
- `hoverable`: Make card respond to hover

### Input Component

```tsx
<Input 
  type="text|password|email|etc"
  placeholder="Enter text"
  className="additional-classes"
/>
```

## Dark Mode Implementation

The dark mode is implemented using the `.dark` class on the HTML element. When this class is present, all dark theme variables are applied.

### Manual Theme Toggle

```tsx
import { useTheme } from "~/hooks/useTheme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
```

### System Preference Detection

The theme system automatically detects system preference:

```typescript
// In useTheme hook
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
```

## Best Practices

### 1. Always Use Theme Variables

✅ **Do:**
```css
color: var(--on-background-color);
```

❌ **Don't:**
```css
color: #191C22; /* Hardcoded color */
```

### 2. Use Semantic Class Names

✅ **Do:**
```html
<div class="bg-surface text-on-surface">
```

❌ **Don't:**
```html
<div class="bg-white text-black dark:bg-gray-900 dark:text-white">
```

### 3. Component Composition

✅ **Do:**
```tsx
<Card bordered elevate>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

❌ **Don't:**
```tsx
<div class="bg-surface border rounded-lg p-4">
  <h3 class="text-lg font-bold">Title</h3>
</div>
```

### 4. Accessibility

Always ensure proper contrast and accessibility:

```tsx
<button 
  aria-label="Action description"
  className="focus:outline-none focus:ring-2 focus:ring-ring"
>
  Action
</button>
```

## Theme Customization

To customize the theme, modify the CSS variables in `apps/web/app/styles/theme.css`:

```css
:root {
  /* Light theme - modify these values */
  --background-color: #F9F9FF;
  --color-primary: #002C5B;
  /* ... other variables */
}

.dark {
  /* Dark theme - modify these values */
  --background-color: #121212;
  --color-primary: #4A6BFF;
  /* ... other variables */
}
```

## Performance Considerations

1. **CSS Variable Performance**: CSS variables have excellent performance characteristics and are widely supported.

2. **Theme Switching**: The theme toggle uses class manipulation which is performant and doesn't cause layout shifts.

3. **Component Optimization**: UI components are optimized for performance with minimal re-renders.

## Browser Support

The theme system supports all modern browsers:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+
- Opera 36+

## Troubleshooting

### Theme Not Applying

1. Check if the theme CSS file is properly imported
2. Verify the `.dark` class is being toggled on the HTML element
3. Ensure CSS variables are correctly defined

### Color Contrast Issues

Use the `text-on-surface` and `text-on-background` classes for proper contrast:

```html
<div class="bg-surface">
  <span class="text-on-surface">Proper contrast</span>
</div>
```

## Future Enhancements

1. **Theme Customization UI**: Allow users to customize theme colors
2. **Multiple Theme Support**: Support for multiple theme presets
3. **CSS-in-JS Integration**: Optional CSS-in-JS support
4. **Advanced Animations**: Smooth theme transition animations

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)