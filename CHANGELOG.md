# Changelog

## [1.1.0] - Code Generators

### Added

#### Code Generation Scripts
- **Component Generator** (`scripts/generate-component.js`)
  - Auto-generates component folder with proper structure
  - Creates component file with TypeScript and React Native imports
  - Generates separate types file for props
  - Includes barrel export (index.ts)
  - Creates test file with basic test cases
  - Validates PascalCase naming convention

- **Hook Generator** (`scripts/generate-hook.js`)
  - Auto-generates custom hook folder
  - Creates hook file with useState/useEffect patterns
  - Generates types file for options and return value
  - Includes barrel export
  - Creates test file with renderHook tests
  - Validates camelCase with "use" prefix

- **Provider Generator** (`scripts/generate-provider.js`)
  - Auto-generates Context provider folder
  - Creates separate context file
  - Generates provider component with state management
  - Creates custom hook to consume context
  - Generates types file for state and context value
  - Includes barrel export
  - Creates comprehensive test file
  - Validates PascalCase naming convention

#### NPM Scripts
Added to `package.json`:
```json
{
  "scripts": {
    "generate:component": "node scripts/generate-component.js",
    "generate:hook": "node scripts/generate-hook.js",
    "generate:provider": "node scripts/generate-provider.js"
  }
}
```

#### Path Aliases
Updated `tsconfig.json` and `babel.config.js`:
- Added `@/providers` path alias
- All generators use path aliases

#### Dependencies
Added testing libraries to `devDependencies`:
- `@testing-library/react-native@^12.8.0`
- `@testing-library/react-hooks@^8.0.1`
- `@testing-library/jest-native@^5.4.3`

#### Documentation
- **GENERATORS.md** - Complete guide for all generators
  - Usage examples
  - Generated file structure
  - Best practices
  - Troubleshooting
  - Advanced usage patterns

- **QUICK_REFERENCE.md** - Quick reference for developers
  - Generator commands
  - Common commands
  - Import patterns
  - Folder structure
  - Step-by-step workflows

- **CHANGELOG.md** - This file

#### Folder Structure
- Created `src/providers/` directory with index.ts
- Created `scripts/` directory for generators

### Changed
- Updated `README.md` with generators section
- Added generators feature to features list

### Generated Structure Examples

#### Component Structure
```
src/components/ComponentName/
├── ComponentName.tsx          # Component implementation
├── types.ts                   # Props interface
├── index.ts                   # Barrel export
└── ComponentName.test.tsx     # Test file
```

#### Hook Structure
```
src/hooks/useHookName/
├── useHookName.ts            # Hook implementation
├── types.ts                  # Options and return types
├── index.ts                  # Barrel export
└── useHookName.test.ts       # Test file
```

#### Provider Structure
```
src/providers/ProviderName/
├── context.ts                      # React Context
├── ProviderNameProvider.tsx        # Provider component
├── useProviderName.ts              # Custom hook
├── types.ts                        # Type definitions
├── index.ts                        # Barrel export
└── ProviderNameProvider.test.tsx   # Test file
```

### Usage Examples

#### Generate Component
```bash
yarn generate:component UserCard

# Generates:
# - src/components/UserCard/UserCard.tsx
# - src/components/UserCard/types.ts
# - src/components/UserCard/index.ts
# - src/components/UserCard/UserCard.test.tsx
```

#### Generate Hook
```bash
yarn generate:hook useAuth

# Generates:
# - src/hooks/useAuth/useAuth.ts
# - src/hooks/useAuth/types.ts
# - src/hooks/useAuth/index.ts
# - src/hooks/useAuth/useAuth.test.ts
```

#### Generate Provider
```bash
yarn generate:provider Theme

# Generates:
# - src/providers/Theme/context.ts
# - src/providers/Theme/ThemeProvider.tsx
# - src/providers/Theme/useTheme.ts
# - src/providers/Theme/types.ts
# - src/providers/Theme/index.ts
# - src/providers/Theme/ThemeProvider.test.tsx
```

### Benefits

1. **Consistency** - All components/hooks/providers follow same structure
2. **Speed** - Generate boilerplate in seconds
3. **Best Practices** - Templates include TypeScript, tests, and proper patterns
4. **Type Safety** - Separate types files for clean type definitions
5. **Testability** - Test files included with basic test cases
6. **Maintainability** - Folder-based structure with barrel exports
7. **Documentation** - Comprehensive guides for all generators

### Technical Details

- All generators use Node.js scripts (CommonJS)
- Executable via yarn scripts
- Validate naming conventions (PascalCase, camelCase)
- Check for existing files to prevent overwrites
- Provide helpful CLI output with next steps
- Include proper error handling

---

## [1.0.0] - Initial Release

### Added
- Expo 52 with TypeScript configuration
- Expo Router for file-based navigation
- OpenAPI code generation with Orval
- React Query for server state management
- Zustand for client state management
- Detox E2E testing setup for iOS and Android
- GitHub Actions CI/CD pipelines
- Barrel exports pattern throughout codebase
- UI component library (Button, Card, Text, Input)
- Custom hooks (useDebounce, useToggle)
- Example screens (Home, Products)
- Complete documentation (README, SETUP, PROJECT_SUMMARY)
- ESLint and Prettier configuration
- Jest testing setup
- Path aliases with TypeScript and Babel
