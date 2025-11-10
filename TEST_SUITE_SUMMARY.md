# Comprehensive Unit Test Suite - Upload Evidence Feature

This document summarizes the comprehensive unit tests created for the Upload Evidence feature refactoring.

## Test Files Created

### 1. useMediaFileManager Hook Tests
**Location**: `src/hooks/useMediaFileManager/__tests__/useMediaFileManager.test.ts`
**Test Count**: 30 tests across 6 describe blocks
**Status**: ✅ All passing

#### Test Coverage:
- **Initial State**: Verifies empty array, hasFiles, fileCount properties
- **addFile**: Single file addition, sequential additions, handle duplicates, video files
- **addFiles**: Multiple files at once, add to existing files, empty arrays, single file, mixed types
- **removeFile**: Remove by ID, preserve other files, non-existent files, update hasFiles, exact ID matching, similar IDs
- **clearFiles**: Clear all files, reset hasFiles, idempotent behavior, allow re-adding after clear
- **hasFiles Computed Property**: False on empty, true with files, updates on add/remove
- **fileCount Computed Property**: Increment, decrement, clear to 0, large numbers
- **Complex Scenarios**: Add/remove/clear operations, file order preservation, large file sets (100 items)

### 2. useMediaPermissions Hook Tests
**Location**: `src/hooks/useMediaPermissions/__tests__/useMediaPermissions.test.ts`
**Test Count**: 20+ tests
**Status**: ✅ Ready for testing

#### Test Coverage:
- **Camera Permission**: State retrieval, status exposure, independent states
- **Photo Library Permission**: State retrieval, status exposure, independent states
- **Media Library Permission**: State retrieval, status exposure, independent states
- **Request Functions**: Camera, photo library, media library permission requests
- **Handle Blocked Permission**: Alert display, correct messages per type, button callbacks
- **Permission Consistency**: Loading/requesting states, mutually exclusive flags
- **Alert Messages**: Relevant content, settings links, proper formatting
- **Multiple Calls**: Sequential requests, multiple dialogs

**Key Mocks**:
- `usePermission` hook for individual permission types
- `Alert` from react-native for permission dialogs

### 3. useMediaPicker Hook Tests
**Location**: `src/hooks/useMediaPicker/__tests__/useMediaPicker.test.ts`
**Test Count**: 25+ tests
**Status**: ✅ Ready for testing

#### Test Coverage:
- **Initial State**: isProcessing false, all methods present, callback acceptance
- **takePhoto**:
  - Permission granted flow
  - File selection callback
  - Permission request on denied
  - Blocked permission dialog
  - Canceled picker handling
  - Concurrent call prevention
  - Camera error handling
- **uploadPhotos**:
  - Photo library launch
  - Multiple photo selection
  - Permission handling
  - Blocked permission dialog
  - Canceled selection
  - Concurrent call prevention
- **uploadVideos**:
  - Video library launch
  - Video file selection
  - Permission handling
  - Blocked permission dialog
  - Canceled selection
- **isProcessing State**: State transitions, completion handling

**Key Mocks**:
- `expo-image-picker` (launchCameraAsync, launchImageLibraryAsync)
- `useMediaPermissions` hook
- `PermissionManager.isGranted`

### 4. useEvidenceUpload Hook Tests
**Location**: `src/hooks/useEvidenceUpload/__tests__/useEvidenceUpload.test.ts`
**Test Count**: 30+ tests
**Status**: ✅ Ready for testing

#### Test Coverage:
- **Initial State**: Progress tracking, upload state, progress property
- **Upload Files**:
  - Single file successful upload
  - Multiple files successful upload
  - URL generation failure handling
  - S3 upload failure handling
  - Confirm upload failure with continuation
  - Partial failures with remaining files
  - Empty input handling
  - Correct MIME types for photos and videos
- **Progress Tracking**:
  - Progress updates during upload
  - isUploading flag transitions
  - currentFile tracking
  - uploadedCount accuracy
  - Total count tracking
- **Upload Result**:
  - Success flag on complete success
  - Failure flag on any error
  - Uploaded URLs collection
  - Error messages collection
- **VisitId Parameter**:
  - Passing to generate URL mutation
  - Passing to confirm upload mutation

**Key Mocks**:
- Generated API hooks (useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost, useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost)
- Global `fetch` for S3 uploads
- FormData for multipart uploads

### 5. UploadEvidenceScreen Component Tests
**Location**: `src/screens/UploadEvidence/__tests__/UploadEvidenceScreen.test.tsx`
**Test Count**: 30+ tests
**Status**: ✅ Ready for testing

#### Test Coverage:
- **Rendering**:
  - Screen renders correctly
  - All buttons present (take photo, upload photo, upload video, upload evidence, skip)
  - Back button present
  - File list display (empty and with files)
  - File count display
- **Button Interactions**:
  - takePhoto button calls hook
  - uploadPhotos button calls hook
  - uploadVideos button calls hook
  - Button disabling during processing
- **File Removal**:
  - Remove button calls hook with file ID
  - Multiple remove buttons for multiple files
- **Upload Functionality**:
  - Warning toast when no files
  - Upload button disabled states (uploading, no files, processing)
  - uploadFiles called with correct files
  - Navigation on successful upload
  - Error toast on upload failure
  - Button text changes (upload/uploading)
- **Skip Functionality**:
  - Skip button navigates to visits
  - Skip button disabled during upload/processing
- **Back Button**:
  - Calls router.back when canGoBack
  - Navigates to visits otherwise
- **File Preview**:
  - File name display
  - All files displayed
  - Mixed file types handled
- **Edge Cases**:
  - Missing visitId handling
  - Rapid file additions
  - Mixed file types

**Key Mocks**:
- `expo-router` (router, useLocalSearchParams)
- `useMediaFileManager` hook
- `useMediaPermissions` hook
- `useMediaPicker` hook
- `useEvidenceUpload` hook
- `useToast` hook
- `useTranslation` hook

## Testing Best Practices Implemented

1. **Proper Act() Usage**: All state updates wrapped in `act()` blocks
2. **Hook Testing**: Using `renderHook` from @testing-library/react-native
3. **Component Testing**: Using `render` and `fireEvent` from @testing-library/react-native
4. **Mock Management**: Comprehensive mocking of dependencies with jest.mock()
5. **Test Organization**: Logical describe blocks for feature areas
6. **Edge Case Coverage**: Empty states, errors, loading states, concurrent operations
7. **User Interaction Testing**: Button presses, state changes, navigation
8. **Callback Testing**: onFilesSelected, onError, Toast notifications
9. **Async Operations**: Proper async/await handling in tests
10. **State Transitions**: Testing before/after state changes

## Running the Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test useMediaFileManager
npm test useMediaPermissions
npm test useMediaPicker
npm test useEvidenceUpload
npm test UploadEvidenceScreen

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test File Locations

All test files follow the project convention of `__tests__/` directory:

```
src/
├── hooks/
│   ├── useMediaFileManager/
│   │   └── __tests__/
│   │       └── useMediaFileManager.test.ts
│   ├── useMediaPermissions/
│   │   └── __tests__/
│   │       └── useMediaPermissions.test.ts
│   ├── useMediaPicker/
│   │   └── __tests__/
│   │       └── useMediaPicker.test.ts
│   └── useEvidenceUpload/
│       └── __tests__/
│           └── useEvidenceUpload.test.ts
└── screens/
    └── UploadEvidence/
        └── __tests__/
            └── UploadEvidenceScreen.test.tsx
```

## Key Features of Test Suite

### Comprehensive Coverage
- Each test file includes 20-30+ test cases
- Tests cover happy paths, error scenarios, and edge cases
- All public methods and properties are tested
- State transitions and side effects are verified

### Maintainability
- Clear test names that describe what is being tested
- Well-organized test groups with describe blocks
- Proper setup and cleanup with beforeEach
- DRY principles applied where appropriate

### Real-World Scenarios
- Tests simulate actual user workflows
- Permission request/grant flows tested
- File upload lifecycle covered
- Error handling and recovery tested
- UI state changes validated

### Mock Strategy
- External dependencies properly mocked
- Mocks reset between tests
- Both successful and failing mock implementations
- Callbacks and side effects tracked

## Coverage Expectations

Based on the test structure:
- **useMediaFileManager**: ~90% code coverage (simple state management)
- **useMediaPermissions**: ~85% code coverage (depends on hook behavior)
- **useMediaPicker**: ~80% code coverage (async operations and permissions)
- **useEvidenceUpload**: ~85% code coverage (async API calls)
- **UploadEvidenceScreen**: ~80% code coverage (component rendering and interactions)

## Notes

1. All tests use Jest and @testing-library/react-native as per project setup
2. Tests follow existing patterns from useCartStore and useDebouncedValue
3. Proper use of `act()` for state updates
4. Mock implementations provide realistic response scenarios
5. Tests are isolated and can run in any order
6. TestID attributes are used for reliable element selection

## Future Enhancements

- Integration tests for complete upload flow
- E2E tests with Playwright
- Performance testing for large file sets
- Visual regression testing for UI components
- Accessibility testing
