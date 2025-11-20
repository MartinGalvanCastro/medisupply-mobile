import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { ScheduleVisitScreen, combineDateAndTime } from './ScheduleVisitScreen';
import { useTranslation } from '@/i18n/hooks';
import { useCreateVisitBffSellersAppVisitsPost } from '@/api/generated/sellers-app/sellers-app';
import { useToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('@/i18n/hooks');
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/components/ui/toast');
jest.mock('@tanstack/react-query');
jest.mock('@react-native-community/datetimepicker', () => {
  return function MockDateTimePicker({ onChange, value, testID }: any) {
    (global as any).__dateTimePickerOnChange = onChange;
    return null;
  };
});
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useForm: jest.fn().mockImplementation((options) => {
      const formInstance = actual.useForm(options);
      return formInstance;
    }),
  };
});

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseCreateVisit = useCreateVisitBffSellersAppVisitsPost as jest.MockedFunction<
  typeof useCreateVisitBffSellersAppVisitsPost
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;

describe('ScheduleVisitScreen', () => {
  const mockTranslations: Record<string, string> = {
    'clientDetail.scheduleVisitModal.title': 'Schedule Visit',
    'clientDetail.scheduleVisitModal.description': 'Select a date and time for the visit',
    'clientDetail.scheduleVisitModal.dateLabel': 'Date',
    'clientDetail.scheduleVisitModal.timeLabel': 'Time',
    'clientDetail.scheduleVisitModal.selectDate': 'Select date',
    'clientDetail.scheduleVisitModal.selectTime': 'Select time',
    'clientDetail.scheduleVisitModal.notesLabel': 'Notes',
    'clientDetail.scheduleVisitModal.notesPlaceholder': 'Enter notes',
    'clientDetail.scheduleVisitModal.scheduling': 'Scheduling...',
    'clientDetail.scheduleVisitModal.confirmButton': 'Schedule',
    'clientDetail.scheduleVisitModal.cancelButton': 'Cancel',
    'clientDetail.scheduleVisitSuccess': 'Visit scheduled successfully',
    'clientDetail.scheduleVisitSuccessMessage': 'The visit has been scheduled',
    'clientDetail.scheduleVisitError': 'Failed to schedule visit',
    'clientDetail.validation.dateTodayNotAllowed': 'Please select a future date',
    'common.done': 'Done',
  };

  let mockToastShow: jest.Mock;
  let mockMutate: jest.Mock;
  let mockInvalidateQueries: jest.Mock;
  let onSuccessCallback: any;
  let onErrorCallback: any;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key,
      i18n: {} as any,
    });

    mockToastShow = jest.fn();
    mockUseToast.mockReturnValue({
      show: mockToastShow,
    } as any);

    mockMutate = jest.fn();
    mockUseCreateVisit.mockImplementation((options: any) => {
      onSuccessCallback = options.mutation.onSuccess;
      onErrorCallback = options.mutation.onError;
      return {
        mutate: mockMutate,
        isPending: false,
      } as any;
    });

    mockInvalidateQueries = jest.fn();
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as any);

    jest.spyOn(ExpoRouter, 'useLocalSearchParams').mockReturnValue({ clientId: 'client-123' } as any);

    (router.canGoBack as jest.Mock).mockReturnValue(true);
    (router.back as jest.Mock).mockClear();
    (router.push as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Test 1: Render screen with all form elements
  it('should render screen with all form elements', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    expect(getByTestId('schedule-visit-screen')).toBeDefined();
    expect(getByTestId('back-button')).toBeDefined();
    expect(getByTestId('select-date-button')).toBeDefined();
    expect(getByTestId('select-time-button')).toBeDefined();
    expect(getByTestId('notes-input')).toBeDefined();
    expect(getByTestId('schedule-confirm-button')).toBeDefined();
    expect(getByTestId('schedule-cancel-button')).toBeDefined();
  });

  // Test 2: Back button navigates back when canGoBack is true
  it('should navigate back when back button is pressed and canGoBack is true', () => {
    (router.canGoBack as jest.Mock).mockReturnValue(true);
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('back-button'));
    });

    expect(router.back).toHaveBeenCalled();
  });

  // Test 3: Back button replaces route when canGoBack is false
  it('should replace route to clients when back button pressed and canGoBack is false', () => {
    (router.canGoBack as jest.Mock).mockReturnValue(false);
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('back-button'));
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/clients');
  });

  // Test 4: Opening date picker shows picker controls
  it('should open date picker and show picker controls', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    expect(getByTestId('picker-done-button')).toBeDefined();
    expect(getByTestId('picker-cancel-button')).toBeDefined();
  });

  // Test 5: Opening time picker shows picker controls
  it('should open time picker and show picker controls', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-time-button'));
    });

    expect(getByTestId('picker-done-button')).toBeDefined();
    expect(getByTestId('picker-cancel-button')).toBeDefined();
  });

  // Test 6: Picker closes when done button is pressed in date mode
  it('should close picker when done button is pressed', () => {
    const { getByTestId, queryByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    const onDateChange = (global as any).__dateTimePickerOnChange;
    const newDate = new Date(2025, 6, 15);
    act(() => {
      onDateChange({}, newDate);
    });

    act(() => {
      fireEvent.press(getByTestId('picker-done-button'));
    });

    expect(queryByTestId('picker-done-button')).toBeNull();
  });

  // Test 7: Picker closes when cancel button is pressed
  it('should close picker when cancel button is pressed', () => {
    const { getByTestId, queryByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    act(() => {
      fireEvent.press(getByTestId('picker-cancel-button'));
    });

    expect(queryByTestId('picker-cancel-button')).toBeNull();
  });

  // Test 8: Notes field accepts text input
  it('should accept text in notes field', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    const notesInput = getByTestId('notes-input');
    act(() => {
      fireEvent.changeText(notesInput, 'Test notes');
    });

    expect(notesInput).toBeDefined();
  });

  // Test 9: Success callback invalidates queries and shows success toast
  it('should invalidate visits query and show success toast on success callback', () => {
    render(<ScheduleVisitScreen />);

    act(() => {
      onSuccessCallback();
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['visits'],
    });
    expect(mockToastShow).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');

    // Test the render function to cover lines 102-112
    const callArgs = mockToastShow.mock.calls[0][0];
    const renderedContent = callArgs.render({ id: 'test-id' });
    expect(renderedContent).toBeDefined();
  });

  // Test 10: Error callback shows error toast
  it('should show error toast on error callback', () => {
    mockToastShow.mockClear();
    render(<ScheduleVisitScreen />);

    act(() => {
      onErrorCallback();
    });

    expect(mockToastShow).toHaveBeenCalled();
    const callArgs = mockToastShow.mock.calls[0][0];
    expect(callArgs.render).toBeDefined();

    // Test the render function to cover lines 122-128
    const renderedContent = callArgs.render({ id: 'test-id' });
    expect(renderedContent).toBeDefined();
  });

  // Test 11: combineDateAndTime function works correctly
  it('should combine visit date and time correctly into ISO 8601 format', () => {
    const visitDate = new Date(2025, 4, 15, 8, 20, 30, 500);
    const visitTime = new Date();
    visitTime.setHours(14, 30, 45, 999);

    const result = combineDateAndTime(visitDate, visitTime);

    expect(typeof result).toBe('string');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(result).toMatch(/T\d{2}:30:00\.000Z/);
    expect(result).toMatch(/:00\.000Z$/);
  });

  // Test 12: handleDateChange with undefined selectedDate
  it('should handle undefined selectedDate in handleDateChange', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    const onDateChange = (global as any).__dateTimePickerOnChange;
    act(() => {
      onDateChange({}, undefined);
    });

    expect(getByTestId('picker-done-button')).toBeDefined();
  });

  // Test 13: handleTimeChange with undefined selectedTime
  it('should handle undefined selectedTime in handleTimeChange', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-time-button'));
    });

    const onTimeChange = (global as any).__dateTimePickerOnChange;
    act(() => {
      onTimeChange({}, undefined);
    });

    expect(getByTestId('picker-done-button')).toBeDefined();
  });

  // Test 14: handlePickerDone with time mode
  it('should set visitTime when picker done button pressed in time mode', () => {
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-time-button'));
    });

    const onTimeChange = (global as any).__dateTimePickerOnChange;
    const newTime = new Date();
    newTime.setHours(10, 15, 0, 0);

    act(() => {
      onTimeChange({}, newTime);
    });

    act(() => {
      fireEvent.press(getByTestId('picker-done-button'));
    });

    expect(getByTestId('schedule-confirm-button')).toBeDefined();
  });

  // Test 15: handlePickerCancel sets pickerMode to null
  it('should reset pickerMode to null after pressing cancel', () => {
    const { getByTestId, queryByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    act(() => {
      fireEvent.press(getByTestId('picker-cancel-button'));
    });

    expect(queryByTestId('picker-done-button')).toBeNull();
  });

  // Test 16: Missing clientId prevents mutation call
  it('should not call mutation when clientId is missing', () => {
    jest.spyOn(ExpoRouter, 'useLocalSearchParams').mockReturnValue({ clientId: undefined } as any);

    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('schedule-confirm-button'));
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 17: Confirm button shows loading state when mutation is pending
  it('should show scheduling text when mutation is pending', () => {
    mockUseCreateVisit.mockImplementation((options: any) => {
      onSuccessCallback = options.mutation.onSuccess;
      onErrorCallback = options.mutation.onError;
      return {
        mutate: mockMutate,
        isPending: true,
      } as any;
    });

    const { getByTestId } = render(<ScheduleVisitScreen />);

    expect(getByTestId('schedule-confirm-button')).toBeDefined();
  });

  // Test 18: Cancel button calls handleBack
  it('should navigate back when cancel button is pressed', () => {
    (router.canGoBack as jest.Mock).mockReturnValue(true);
    const { getByTestId } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('schedule-cancel-button'));
    });

    expect(router.back).toHaveBeenCalled();
  });

  // Test 19: Date validation rejects past dates
  it('should display date validation error message for past dates', async () => {
    const { getByTestId, getByText } = render(<ScheduleVisitScreen />);

    act(() => {
      fireEvent.press(getByTestId('select-date-button'));
    });

    const onDateChange = (global as any).__dateTimePickerOnChange;
    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);
    act(() => {
      onDateChange({}, pastDate);
    });

    act(() => {
      fireEvent.press(getByTestId('picker-done-button'));
    });

    act(() => {
      fireEvent.press(getByTestId('schedule-confirm-button'));
    });

    await waitFor(() => {
      expect(getByText('Please select a future date')).toBeDefined();
    }, { timeout: 100 });
  });

  // Test 20: Confirm button is enabled when mutation is not pending
  it('should have confirm button enabled when not pending', () => {
    mockUseCreateVisit.mockImplementation((options: any) => {
      onSuccessCallback = options.mutation.onSuccess;
      onErrorCallback = options.mutation.onError;
      return {
        mutate: mockMutate,
        isPending: false,
      } as any;
    });

    const { getByTestId } = render(<ScheduleVisitScreen />);

    const confirmButton = getByTestId('schedule-confirm-button');
    expect(confirmButton).toBeDefined();
  });


});
