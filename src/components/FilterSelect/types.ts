export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  testID?: string;
}
