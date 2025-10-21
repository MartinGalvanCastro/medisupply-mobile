# Gluestack UI Integration

This project uses [Gluestack UI](https://gluestack.io/) for all basic and common UI components, providing a consistent, accessible, and themeable design system.

## What is Gluestack UI?

Gluestack UI is a universal UI library that provides:
- **Cross-platform** - Works on iOS, Android, and Web
- **Accessible** - ARIA compliant components
- **Themeable** - Customizable design tokens
- **TypeScript** - Full type safety
- **Performance** - Optimized for React Native

## Installation

Gluestack UI is already installed and configured in this project:

```json
{
  "dependencies": {
    "@gluestack-ui/themed": "^1.1.58",
    "@gluestack-style/react": "^1.0.58",
    "react-native-svg": "15.8.0"
  }
}
```

## Configuration

### Theme Configuration

Custom theme is defined in `gluestack-ui.config.ts`:

```typescript
import { config as defaultConfig } from '@gluestack-ui/config';

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary: '#007AFF',
      secondary: '#5856D6',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
  },
};
```

### Provider Setup

The `GluestackProvider` wraps the entire app in `app/_layout.tsx`:

```typescript
import { GluestackProvider } from '@/providers';

export default function RootLayout() {
  return (
    <GluestackProvider>
      <QueryClientProvider client={queryClient}>
        {/* App content */}
      </QueryClientProvider>
    </GluestackProvider>
  );
}
```

## Available Components

### Layout Components

```typescript
import { Box, VStack, HStack, Center } from '@gluestack-ui/themed';

// Box - Flexible container
<Box p="$4" bg="$backgroundLight50">
  Content
</Box>

// VStack - Vertical stack
<VStack space="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>

// HStack - Horizontal stack
<HStack space="sm" alignItems="center">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>
```

### Typography

```typescript
import { Heading, Text } from '@gluestack-ui/themed';

// Heading
<Heading size="2xl">Large Title</Heading>
<Heading size="xl">Title</Heading>
<Heading size="lg">Subtitle</Heading>
<Heading size="md">Section Title</Heading>

// Text
<Text size="lg">Large text</Text>
<Text size="md">Normal text</Text>
<Text size="sm">Small text</Text>
<Text color="$textLight600">Muted text</Text>
```

### Buttons

```typescript
import { Button, ButtonText } from '@gluestack-ui/themed';

// Primary button
<Button>
  <ButtonText>Click Me</ButtonText>
</Button>

// Secondary button
<Button action="secondary">
  <ButtonText>Secondary</ButtonText>
</Button>

// Outline button
<Button variant="outline">
  <ButtonText>Outline</ButtonText>
</Button>

// Disabled button
<Button isDisabled>
  <ButtonText>Disabled</ButtonText>
</Button>
```

### Input

```typescript
import { Input, InputField } from '@gluestack-ui/themed';

<Input variant="outline" size="md">
  <InputField
    placeholder="Enter text..."
    value={value}
    onChangeText={setValue}
  />
</Input>

// With error state
<Input variant="outline" isInvalid>
  <InputField placeholder="Invalid input" />
</Input>
```

### Card

```typescript
import { Card } from '@gluestack-ui/themed';

<Card size="md" variant="elevated">
  <VStack space="md">
    <Heading size="lg">Card Title</Heading>
    <Text>Card content</Text>
  </VStack>
</Card>
```

### Loading States

```typescript
import { Spinner, Center } from '@gluestack-ui/themed';

<Center flex={1}>
  <Spinner size="large" />
</Center>
```

### Pressable

```typescript
import { Pressable, Text } from '@gluestack-ui/themed';

<Pressable onPress={() => console.log('Pressed')}>
  <Text>Press me</Text>
</Pressable>
```

## Design Tokens

Gluestack uses design tokens for consistent spacing, colors, and sizing:

### Spacing

- `$1` through `$12` - Predefined spacing units
- `$xs`, `$sm`, `$md`, `$lg`, `$xl`, `$2xl` - Named spacing

```typescript
<Box p="$4">         // padding: 16px
<Box m="$2">         // margin: 8px
<VStack space="md">  // gap: medium spacing
```

### Colors

- `$primary500` - Primary color
- `$secondary500` - Secondary color
- `$success500` - Success color
- `$error500` - Error color
- `$textLight600` - Text color
- `$backgroundLight50` - Background color

```typescript
<Text color="$primary500">Primary text</Text>
<Box bg="$backgroundLight50">Container</Box>
```

### Sizes

- `sm`, `md`, `lg`, `xl`, `2xl` - Component sizes

```typescript
<Button size="md">Button</Button>
<Heading size="xl">Heading</Heading>
<Input size="lg">Input</Input>
```

## Usage Examples

### Form with Validation

```typescript
import { VStack, Input, InputField, Button, ButtonText, Text } from '@gluestack-ui/themed';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <VStack space="md" p="$4">
      <Input variant="outline" isInvalid={!!error}>
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </Input>
      {error && <Text color="$error500">{error}</Text>}
      <Button>
        <ButtonText>Login</ButtonText>
      </Button>
    </VStack>
  );
}
```

### Card List

```typescript
import { FlatList } from 'react-native';
import { Box, Card, VStack, Heading, Text } from '@gluestack-ui/themed';

function CardList({ items }) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Box px="$4">
          <Card size="md" variant="elevated" mb="$4">
            <VStack space="sm">
              <Heading size="md">{item.title}</Heading>
              <Text>{item.description}</Text>
            </VStack>
          </Card>
        </Box>
      )}
    />
  );
}
```

### Complex Layout

```typescript
import { Box, VStack, HStack, Heading, Text, Button, ButtonText } from '@gluestack-ui/themed';

function Dashboard() {
  return (
    <Box flex={1} p="$6" bg="$backgroundLight50">
      <VStack space="xl">
        <Heading size="2xl">Dashboard</Heading>

        <HStack space="md">
          <Box flex={1} p="$4" bg="$primary500" borderRadius="$lg">
            <Text color="$white">Total Sales</Text>
            <Heading size="xl" color="$white">$12,345</Heading>
          </Box>
          <Box flex={1} p="$4" bg="$secondary500" borderRadius="$lg">
            <Text color="$white">Orders</Text>
            <Heading size="xl" color="$white">234</Heading>
          </Box>
        </HStack>

        <Button>
          <ButtonText>View Details</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
```

## Component Re-exports

For convenience, commonly used Gluestack components are re-exported from `@/components/ui`:

```typescript
// Instead of
import { Box, Text, Button } from '@gluestack-ui/themed';

// You can use
import { Box, Text, Button } from '@/components/ui';
```

Available re-exports:
- Box, VStack, HStack, Center
- Text, Heading
- Button, ButtonText
- Card
- Input, InputField
- Spinner
- Pressable
- ScrollView

## Customization

### Extending the Theme

Edit `gluestack-ui.config.ts` to customize:

```typescript
export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      // Add custom colors
      brand: '#FF6B6B',
    },
    space: {
      ...defaultConfig.tokens.space,
      // Add custom spacing
      '13': 52,
    },
  },
};
```

### Custom Components

Create custom components using Gluestack primitives:

```typescript
import { Box, Text } from '@gluestack-ui/themed';

export function Badge({ children, variant = 'default' }) {
  const bgColor = variant === 'success' ? '$success500' : '$primary500';

  return (
    <Box
      bg={bgColor}
      px="$2"
      py="$1"
      borderRadius="$full"
    >
      <Text size="xs" color="$white">
        {children}
      </Text>
    </Box>
  );
}
```

## Migration from Custom Components

Old custom components have been replaced with Gluestack:

| Old Component | New Component | Notes |
|--------------|---------------|-------|
| `<Button>` | `<Button><ButtonText>Text</ButtonText></Button>` | Nested structure |
| `<Text variant="h1">` | `<Heading size="2xl">` | Use Heading for titles |
| `<Text>` | `<Text>` | Same name, different API |
| `<Card>` | `<Card>` | Similar API |
| `<Input>` | `<Input><InputField /></Input>` | Nested structure |

## Resources

- [Gluestack UI Documentation](https://ui.gluestack.io/)
- [Component Reference](https://ui.gluestack.io/docs/components)
- [Theme Tokens](https://ui.gluestack.io/docs/theme)
- [Styling Guide](https://ui.gluestack.io/docs/styling)

## Benefits

✅ **Consistent Design** - All components follow same design language
✅ **Accessibility** - Built-in ARIA support
✅ **Cross-platform** - Works seamlessly across iOS, Android, Web
✅ **Type Safe** - Full TypeScript support
✅ **Themeable** - Easy to customize and extend
✅ **Well Documented** - Comprehensive documentation
✅ **Actively Maintained** - Regular updates and community support
