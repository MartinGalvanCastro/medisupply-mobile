export enum InstitutionType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinica',
  LABORATORY = 'laboratorio',
  DIAGNOSTIC_CENTER = 'centro_diagnostico',
}

export const InstitutionTypeLabels = {
  [InstitutionType.HOSPITAL]: 'auth.signup.tipo_hospital',
  [InstitutionType.CLINIC]: 'auth.signup.tipo_clinica',
  [InstitutionType.LABORATORY]: 'auth.signup.tipo_laboratorio',
  [InstitutionType.DIAGNOSTIC_CENTER]: 'auth.signup.tipo_centro_diagnostico',
} as const;
