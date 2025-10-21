export type UseToggleReturn = [
  /** Current boolean value */
  boolean,
  /** Toggle function */
  () => void,
  /** Set value function */
  (value: boolean) => void
];
