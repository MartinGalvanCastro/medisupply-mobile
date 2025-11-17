export interface BottomSheetOption {
  label: string;
  value: string;
}

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  options: BottomSheetOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  testID?: string;
}
